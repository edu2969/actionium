// app/api/company/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/utils/auth';
import { connectMongoDB } from '@/lib/mongodb';
import Client from '@/models/client';
import Contract from '@/models/contract';
import Project from '@/models/project';
import Task from '@/models/task';
import { calculateContractProfitability } from '@/lib/contractProfitability';
import { TASK_STATUS } from '@/app/utils/constants';
import { 
    DashboardResponse, 
    DashboardClient, 
    DashboardContract,
    ProcessedClient,
    ProcessedContract,
    LeanClient,
    LeanContract,
    LeanProject,
    LeanTask 
} from '@/lib/types';

const isClientArchived = (client: LeanClient): boolean =>
    (client.preferences?.archived ?? client.archived) === true;

export async function GET(request: NextRequest): Promise<NextResponse<DashboardResponse | { error: string }>> {
    await connectMongoDB();
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Tipar correctamente las consultas
        const includeArchived =
            request.nextUrl.searchParams.get("archived") === "true";
        const clients = (await Client.find({ name: { $ne: "yGa" } }).lean() as unknown as LeanClient[])
            .filter((client) => includeArchived || !isClientArchived(client));

        const clientsWithData = await Promise.all(
            clients.map(async (client: LeanClient) => {
                const contracts = await Contract.find({
                    clientId: client._id
                }).lean() as unknown as LeanContract[];

                const contractsWithData: ProcessedContract[] = await Promise.all(
                    contracts.map(async (contract: LeanContract) => {
                        const projects = await Project.find({
                            contractId: contract._id
                        }).lean() as unknown as LeanProject[];

                        const projectsWithTasks = await Promise.all(
                            projects.map(async (project: LeanProject) => {
                                const tasks = await Task.find({
                                    projectId: project._id
                                }).lean() as LeanTask[];

                                const totalTasks = tasks.length;
                                const completedTasks = tasks.filter((t: LeanTask) => t.status === TASK_STATUS.closed);
                                const progress = totalTasks > 0 ? (completedTasks.length / totalTasks) * 100 : 0;

                                const totalHours = tasks.reduce((sum: number, task: LeanTask) => {
                                    return sum + (task.logs?.reduce((s: number, log: any) => s + log.hours, 0) || 0);
                                }, 0);

                                const rentability = project.netAmount && totalHours > 0
                                    ? Math.min(100, (project.netAmount / (totalHours * 50)) * 100)
                                    : 0;

                                return {
                                    ...project,
                                    progress,
                                    totalHours,
                                    rentability: Math.round(rentability),
                                    tasks: tasks.map((task: LeanTask) => ({
                                        id: task._id,
                                        title: task.title || 'Sin título',
                                        status: task.status,
                                        progress: task.progress || 0,
                                        hours: task.logs?.reduce((sum: number, log: any) => sum + log.hours, 0) || 0,
                                        completed: task.status === TASK_STATUS.closed,
                                        endDate: task.endDate
                                    }))
                                };
                            })
                        );

                        const notifications: Array<{ type: string; message: string }> = [];

                        if (contract.balance && contract.balance > 0) {
                            notifications.push({
                                type: "payment",
                                message: `Pago pendiente: $${contract.balance}`
                            });
                        }

                        const overdueTasks = projectsWithTasks.flatMap((p: any) =>
                            p.tasks.filter((t: any) => 
                                t.status !== TASK_STATUS.closed && t.endDate && new Date(t.endDate) < new Date()
                            )
                        );

                        if (overdueTasks.length > 0) {
                            notifications.push({
                                type: "deadline",
                                message: `${overdueTasks.length} tareas atrasadas`
                            });
                        }

                        const pendingReviewTasks = projectsWithTasks.flatMap((p: any) =>
                            p.tasks.filter((t: any) => t.status === 50)
                        );

                        if (pendingReviewTasks.length > 0) {
                            notifications.push({
                                type: "review",
                                message: `${pendingReviewTasks.length} tareas en revisión`
                            });
                        }

                        // Determinar el status como string literal
                        let status: DashboardContract['status'] = 'suspended';
                        if (contract.status === 1) status = 'active';
                        else if (contract.status === 2) status = 'pending';
                        else if (contract.status === 3) status = 'completed';

                        return {
                            id: contract._id.toString(),
                            name: contract.title || `Contrato ${contract.identifier}`,
                            status,
                            currency: contract.currency || 'CLP',
                            profitability: calculateContractProfitability(
                                contract.netAmount,
                                contract.currency || 'CLP'
                            ),
                            netAmount: contract.netAmount,
                            notifications: notifications.slice(0, 3),
                            notificationCount: notifications.length
                        };
                    })
                );

                // Calcular salud del cliente
                const totalContracts = contractsWithData.length;
                const activeContracts = contractsWithData.filter((c: ProcessedContract) => c.status === 'active').length;
                const completedContracts = contractsWithData.filter((c: ProcessedContract) => c.status === 'completed').length;

                let health = 85;
                if (activeContracts / totalContracts > 0.5) health += 10;
                if (completedContracts / totalContracts > 0.3) health += 5;

                const contractsWithProfitability = contractsWithData.filter(
                    (contract: ProcessedContract) => contract.profitability !== null
                );
                const avgProfitability = contractsWithProfitability.length > 0
                    ? contractsWithProfitability.reduce(
                        (sum: number, contract: ProcessedContract) =>
                            sum + (contract.profitability ?? 0),
                        0
                    ) / contractsWithProfitability.length
                    : 0;

                if (avgProfitability > 70) health += 5;
                if (avgProfitability < 50) health -= 10;

                const alerts: string[] = [];
                if (health < 70) alerts.push('retraso_pago');
                if (health < 60) alerts.push('retraso_respuesta');
                if (health < 50) alerts.push('retraso_tarea');

                const revenue = contractsWithData
                    .filter((c: ProcessedContract) => c.status === 'active')
                    .reduce((sum: number, c: ProcessedContract) => sum + (c.netAmount || 0), 0) / 1000;

                const growth = Math.round(
                    (activeContracts / Math.max(1, totalContracts)) * 20 - 10
                );

                return {
                    id: client._id.toString(),
                    name: client.name,
                    type: 'client' as const,
                    archived: isClientArchived(client),
                    health: Math.min(100, Math.max(0, Math.round(health))),
                    alerts,
                    logo: client.imgLogo || '',
                    revenue: Math.round(revenue * 10) / 10,
                    growth,
                    contracts: contractsWithData
                };
            })
        );

        // Calcular datos de la compañía
        const totalHealth = clientsWithData.reduce((sum: number, c: ProcessedClient) => sum + c.health, 0);
        const avgHealth = clientsWithData.length > 0
            ? Math.round(totalHealth / clientsWithData.length)
            : 95;

        const totalAlerts = clientsWithData.reduce((sum: number, c: ProcessedClient) => sum + c.alerts.length, 0);
        const efficiency = Math.min(100, Math.max(0, avgHealth - totalAlerts * 2));

        const response: DashboardResponse = {
            central: {
                id: 'central',
                type: 'company',
                health: avgHealth,
                power: Math.min(100, Math.max(0, avgHealth + 5)),
                efficiency: efficiency,
                logo: '/clientes/yga-neon.png'
            },
            clients: clientsWithData
        };

        return NextResponse.json(response);

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}