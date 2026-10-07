"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { FiBell, FiEye } from "react-icons/fi";
import { RiPencilLine } from "react-icons/ri";
import type {
    ClientPreferencesResponse,
    DashboardClient,
    DashboardContract,
    DashboardResponse,
} from "@/lib/types";
import { getClientImageSrc } from "@/lib/clientImage";
import ProjectWorkflowPanel, {
    type WorkflowSprint,
    type WorkflowTask,
    type WorkflowTaskForm,
    type WorkflowLog,
    type WorkflowTodo,
    type WorkflowUser,
} from "./ProjectWorkflowPanel";

interface ControlPanelProps {
    companyData: DashboardResponse;
    selectedClientId: string | null;
    selectedContractId: string | null;
    includeArchivedClients: boolean;
    isVisible: boolean;
    onClose: () => void;
    onToggleArchivedClients: (includeArchived: boolean) => void;
    onClientStatusChanged: () => void;
    selectClient: (clientId: string) => void;
    selectContract: (contractId: string, clientId: string) => void;
}

interface NewClientForm {
    name: string;
    completeName: string;
    identificationId: string;
    identificationType: string;
    email: string;
    address: string;
    imgLogo: string;
}

interface ContractProject {
    id: string;
    identifier: number;
    projectType: number;
    title: string;
    status: number;
    progress: number;
    rentability: number;
    kickOff: string | null;
    end: string | null;
}

interface LatestActiveProject extends ContractProject {
    totalTodos: number;
    completedTodos: number;
    remainingTodos: number;
}

type ContractTask = WorkflowTask;
type ContractTodo = WorkflowTodo;
type ContractUser = WorkflowUser;
type TaskEditForm = WorkflowTaskForm;
type SprintCard = WorkflowSprint;
type ContractLog = WorkflowLog;

type ContractPanelView =
    | "details"
    | "projects"
    | "project"
    | "new-project"
    | "edit-project"
    | "tasks"
    | "sprints"
    | "edit-task"
    | "new-task";

interface ProjectEditForm {
    title: string;
    projectType: string;
    status: string;
    kickOff: string;
}

interface TaskForm {
    title: string;
    taskType: string;
    status: string;
    weight: string;
    assignedTo: string;
    description: string;
    startDate: string;
    endDate: string;
    todos: ContractTodo[];
}

const INITIAL_CLIENT_FORM: NewClientForm = {
    name: "",
    completeName: "",
    identificationId: "",
    identificationType: "RUT",
    email: "",
    address: "",
    imgLogo: "",
};

const INITIAL_PROJECT_FORM: ProjectEditForm = {
    title: "",
    projectType: "1",
    status: "0",
    kickOff: "",
};

const INITIAL_TASK_FORM: TaskForm = {
    title: "",
    taskType: "1",
    status: "0",
    weight: "",
    assignedTo: "",
    description: "",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: "",
    todos: [],
};

const INITIAL_TASK_EDIT_FORM: TaskEditForm = {
    title: "",
    taskType: "1",
    status: "0",
    assignedTo: "",
    description: "",
    startDate: "",
    endDate: "",
    todos: [],
    logs: [],
};

const PROJECT_TYPE_LABELS: Record<number, string> = {
    1: "Desarrollo",
    2: "Mantención",
    3: "Web",
    4: "Terreno",
};

const PROJECT_STATUS_LABELS: Record<number, string> = {
    0: "En definición",
    1: "Activo",
    2: "Inactivo",
    3: "Cerrado",
    4: "Extendido",
};

const TASK_TYPE_OPTIONS = [
    { value: "1", label: "Desarrollo" },
    { value: "2", label: "Corrección" },
    { value: "3", label: "Garantía" },
    { value: "4", label: "Terreno" },
    { value: "5", label: "Gestión" },
    { value: "6", label: "Capacitación" },
];

const TASK_STATUS_OPTIONS = [
    { value: "0", label: "En definición" },
    { value: "1", label: "Activo" },
    { value: "2", label: "Inactivo" },
    { value: "3", label: "Cerrado" },
];

const toDateInputValue = (date: string | null | undefined): string => {
    if (!date) return "";
    const parsedDate = new Date(date);
    return Number.isNaN(parsedDate.getTime())
        ? ""
        : parsedDate.toISOString().slice(0, 10);
};

const formatLocalDate = (date: Date): string =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
        date.getDate()
    ).padStart(2, "0")}`;

const estimateWorkEndDate = (startDate: string, hours: number): string => {
    if (!startDate || !Number.isFinite(hours) || hours <= 0) return "";

    const end = new Date(`${startDate}T08:00:00`);
    let remainingHours = hours;
    while (remainingHours > 0) {
        const day = end.getDay();
        if (day === 0 || day === 6) {
            end.setDate(end.getDate() + (day === 6 ? 2 : 1));
            end.setHours(8, 0, 0, 0);
            continue;
        }
        if (end.getHours() < 8) end.setHours(8, 0, 0, 0);
        if (end.getHours() >= 13 && end.getHours() < 14) {
            end.setHours(14, 0, 0, 0);
            continue;
        }
        if (end.getHours() >= 17) {
            end.setDate(end.getDate() + 1);
            end.setHours(8, 0, 0, 0);
            continue;
        }

        const availableHours =
            end.getHours() < 13 ? 13 - end.getHours() : 17 - end.getHours();
        const allocatedHours = Math.min(availableHours, remainingHours);
        end.setTime(end.getTime() + allocatedHours * 60 * 60 * 1000);
        remainingHours -= allocatedHours;
    }
    return formatLocalDate(end);
};

const nextWorkday = (date: Date): Date => {
    const next = new Date(date);
    next.setDate(next.getDate() + 1);
    if (next.getDay() === 6) next.setDate(next.getDate() + 2);
    if (next.getDay() === 0) next.setDate(next.getDate() + 1);
    next.setHours(8, 0, 0, 0);
    return next;
};

const contractStatusLabels: Record<DashboardContract["status"], string> = {
    active: "Activo",
    pending: "Pendiente",
    completed: "Completado",
    suspended: "Suspendido",
    expired: "Expirado",
    cancelled: "Cancelado",
};

export default function ControlPanel({
    companyData,
    selectedClientId,
    selectedContractId,
    includeArchivedClients,
    isVisible,
    onClose,
    onToggleArchivedClients,
    onClientStatusChanged,
    selectClient,
    selectContract,
}: ControlPanelProps) {
    const queryClient = useQueryClient();
    const router = useRouter();
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [clientPendingGraphRefresh, setClientPendingGraphRefresh] =
        useState<string | null>(null);
    const [form, setForm] = useState<NewClientForm>(INITIAL_CLIENT_FORM);
    const [archiveConfirmationClientId, setArchiveConfirmationClientId] =
        useState<string | null>(null);
    const [archiveConfirmationChecked, setArchiveConfirmationChecked] =
        useState(false);
    const [updatingArchiveClientId, setUpdatingArchiveClientId] = useState<
        string | null
    >(null);
    const [archiveError, setArchiveError] = useState<string | null>(null);
    const [contractPanelView, setContractPanelView] =
        useState<ContractPanelView>("details");
    const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
    const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
    const [projectForm, setProjectForm] =
        useState<ProjectEditForm>(INITIAL_PROJECT_FORM);
    const [taskForm, setTaskForm] = useState<TaskForm>(INITIAL_TASK_FORM);
    const [taskEditForm, setTaskEditForm] = useState<TaskEditForm>(
        INITIAL_TASK_EDIT_FORM
    );
    const [projectFormError, setProjectFormError] = useState<string | null>(
        null
    );
    const [taskFormError, setTaskFormError] = useState<string | null>(null);
    const [isSavingProject, setIsSavingProject] = useState(false);
    const [isSavingTask, setIsSavingTask] = useState(false);

    const selectedClient = companyData.clients.find(
        (client) => client.id === selectedClientId
    );
    const selectedContract = selectedClient?.contracts.find(
        (contract) => contract.id === selectedContractId
    );
    const {
        data: latestActiveProjectData,
        isLoading: isLatestProjectLoading,
        error: latestProjectError,
    } = useQuery<{ project: LatestActiveProject | null }>({
        queryKey: ["contract-latest-active-project", selectedContractId],
        enabled: Boolean(selectedContractId),
        queryFn: async () => {
            const response = await fetch(
                `/api/contracts/${encodeURIComponent(selectedContractId!)}/active-project`
            );
            const result = (await response.json()) as {
                project?: LatestActiveProject | null;
                error?: string;
            };
            if (!response.ok || !("project" in result)) {
                throw new Error(
                    result.error || "No se pudo cargar el último proyecto activo."
                );
            }
            return { project: result.project ?? null };
        },
    });
    const latestActiveProject = latestActiveProjectData?.project;
    const { data: contractProjects, isLoading: areProjectsLoading, error: projectsError } =
        useQuery<{ projects: ContractProject[] }>({
            queryKey: ["contract-projects", selectedContractId],
            enabled:
                Boolean(selectedContractId) &&
                ["projects", "edit-project"].includes(contractPanelView),
            queryFn: async () => {
                const response = await fetch(
                    `/api/projects?contractId=${encodeURIComponent(selectedContractId!)}`
                );
                const result = (await response.json()) as {
                    projects?: ContractProject[];
                    error?: string;
                };
                if (!response.ok || !result.projects) {
                    throw new Error(
                        result.error || "No se pudieron cargar los proyectos."
                    );
                }
                return { projects: result.projects };
            },
        });

    const activeProject =
        contractProjects?.projects.find(
            (project) => project.id === activeProjectId
        ) ??
        (latestActiveProject?.id === activeProjectId
            ? latestActiveProject
            : undefined);
    const {
        data: projectTasks,
        isLoading: areTasksLoading,
        error: tasksError,
    } = useQuery<{ tasks: ContractTask[] }>({
        queryKey: ["project-tasks", activeProjectId],
        enabled:
            Boolean(activeProjectId) &&
            ["project", "tasks", "sprints", "edit-task", "new-task"].includes(
                contractPanelView
            ),
        queryFn: async () => {
            const response = await fetch(
                `/api/tasks?projectId=${encodeURIComponent(activeProjectId!)}`
            );
            const result = (await response.json()) as {
                tasks?: ContractTask[];
                error?: string;
            };
            if (!response.ok || !result.tasks) {
                throw new Error(
                    result.error || "No se pudieron cargar las tareas."
                );
            }
            return { tasks: result.tasks };
        },
    });
    const { data: taskUsers } = useQuery<{ users: ContractUser[] }>({
        queryKey: ["task-users"],
        enabled: ["new-task", "edit-task"].includes(contractPanelView),
        queryFn: async () => {
            const response = await fetch("/api/users");
            const result = (await response.json()) as {
                users?: ContractUser[];
                error?: string;
            };
            if (!response.ok || !result.users) {
                throw new Error(result.error || "No se pudieron cargar los usuarios.");
            }
            return { users: result.users };
        },
    });
    const activeTask = projectTasks?.tasks.find(
        (task) => task.id === activeTaskId
    );
    const sprintCards: SprintCard[] = [];
    for (const task of projectTasks?.tasks ?? []) {
        for (const todo of task.todos ?? []) {
            let sprint = sprintCards[sprintCards.length - 1];
            if (!sprint || sprint.hours + todo.hours > 40) {
                const startDate =
                    (sprint?.endDate
                        ? nextWorkday(sprint.endDate)
                        : null) ??
                    (task.startDate ? new Date(task.startDate) : null) ??
                    (activeProject?.kickOff
                        ? new Date(activeProject.kickOff)
                        : null);
                sprint = {
                    taskTitles: [],
                    todoTitles: [],
                    hours: 0,
                    completedHours: 0,
                    startDate,
                    endDate: null,
                };
                sprintCards.push(sprint);
            }
            if (!sprint.taskTitles.includes(task.title)) {
                sprint.taskTitles.push(task.title);
            }
            sprint.todoTitles.push(todo.title);
            sprint.hours += todo.hours;
            if (todo.finishedAt) sprint.completedHours += todo.hours;
            if (sprint.startDate) {
                const endDate = estimateWorkEndDate(
                    formatLocalDate(sprint.startDate),
                    sprint.hours
                );
                sprint.endDate = endDate
                    ? new Date(`${endDate}T08:00:00`)
                    : null;
            }
        }
    }
    const isWorkflowSaving = isSavingProject || isSavingTask;

    useEffect(() => {
        setContractPanelView("details");
        setActiveProjectId(null);
        setActiveTaskId(null);
        setProjectFormError(null);
        setTaskFormError(null);
    }, [selectedContractId]);

    const showContractProjects = () => {
        setContractPanelView("projects");
        setActiveProjectId(null);
    };

    const showProjectDetails = (project: ContractProject) => {
        setActiveProjectId(project.id);
        setContractPanelView("project");
    };

    const openProjectEditor = (
        project: Pick<
            ContractProject,
            "id" | "title" | "projectType" | "status" | "kickOff"
        >
    ) => {
        setActiveProjectId(project.id);
        setProjectForm({
            title: project.title,
            projectType: String(project.projectType),
            status: String(project.status),
            kickOff:
                toDateInputValue(project.kickOff) ||
                new Date().toISOString().slice(0, 10),
        });
        setProjectFormError(null);
        setContractPanelView("edit-project");
    };

    const openNewProject = () => {
        setProjectForm({
            ...INITIAL_PROJECT_FORM,
            kickOff: new Date().toISOString().slice(0, 10),
        });
        setProjectFormError(null);
        setContractPanelView("new-project");
    };

    const saveProject = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!selectedContractId || (contractPanelView !== "new-project" && !activeProjectId)) {
            setProjectFormError("No se encontró el proyecto que se quiere editar.");
            return;
        }

        setIsSavingProject(true);
        setProjectFormError(null);
        try {
            const response = await fetch(
                contractPanelView === "new-project"
                    ? "/api/projects"
                    : `/api/projects/${encodeURIComponent(activeProjectId!)}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...(activeProject ?? {}),
                        title: projectForm.title.trim(),
                        projectType: Number(projectForm.projectType),
                        status: Number(projectForm.status),
                        kickOff: new Date(
                            `${projectForm.kickOff}T08:00:00`
                        ).toISOString(),
                        contractId: selectedContractId,
                    }),
                }
            );
            const result = (await response.json()) as {
                error?: string;
                project?: ContractProject;
                _id?: string;
                id?: string;
            };
            if (!response.ok) {
                throw new Error(
                    result.error || "No se pudo guardar el proyecto."
                );
            }

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["contract-projects", selectedContractId],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["contract-latest-active-project", selectedContractId],
                }),
                queryClient.invalidateQueries({ queryKey: ["panel-data"] }),
            ]);
            setActiveProjectId(
                result.project?.id ??
                    result._id ??
                    result.id ??
                    activeProjectId
            );
            setContractPanelView("projects");
        } catch (error) {
            setProjectFormError(
                error instanceof Error
                    ? error.message
                    : "Ocurrió un error al actualizar el proyecto."
            );
        } finally {
            setIsSavingProject(false);
        }
    };

    const saveTask = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!activeProject || !selectedContractId) return;

        const todosHours = taskForm.todos.reduce(
            (sum, todo) => sum + todo.hours,
            0
        );
        const weight = taskForm.todos.length
            ? todosHours
            : Number(taskForm.weight);
        const estimatedEndDate = estimateWorkEndDate(
            taskForm.startDate,
            weight
        );
        if (!Number.isFinite(weight) || weight < 0) {
            setTaskFormError("Ingresa una estimación de horas válida.");
            return;
        }
        if (
            !taskForm.title.trim() ||
            taskForm.todos.some(
                (todo) => !todo.title.trim() || todo.hours < 0
            )
        ) {
            setTaskFormError(
                "Completa el título de la tarea y los títulos de sus TODOs."
            );
            return;
        }

        setIsSavingTask(true);
        setTaskFormError(null);
        try {
            const response = await fetch("/api/tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectId: activeProject.id,
                    title: taskForm.title.trim(),
                    taskType: Number(taskForm.taskType),
                    status: Number(taskForm.status),
                    weight,
                    estimatedWeight: weight,
                    description: taskForm.description.trim(),
                    assignedTo: taskForm.assignedTo || undefined,
                    startDate: taskForm.startDate
                        ? new Date(
                              `${taskForm.startDate}T08:00:00`
                          ).toISOString()
                        : null,
                    endDate: estimatedEndDate
                        ? new Date(`${estimatedEndDate}T08:00:00`).toISOString()
                        : null,
                    todos: taskForm.todos,
                    logs: [],
                    progress: 0,
                }),
            });
            const result = (await response.json()) as { error?: string };
            if (!response.ok) {
                throw new Error(result.error || "No se pudo crear la tarea.");
            }

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["contract-projects", selectedContractId],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["project-tasks", activeProject.id],
                }),
                queryClient.invalidateQueries({ queryKey: ["panel-data"] }),
            ]);
            setTaskForm(INITIAL_TASK_FORM);
            setContractPanelView("tasks");
        } catch (error) {
            setTaskFormError(
                error instanceof Error
                    ? error.message
                    : "Ocurrió un error al crear la tarea."
            );
        } finally {
            setIsSavingTask(false);
        }
    };

    const openTaskEditor = (task: ContractTask) => {
        setActiveTaskId(task.id);
        setTaskEditForm({
            title: task.title,
            taskType: String(task.taskType),
            status: String(task.status),
            assignedTo: task.assignedTo ?? "",
            description: task.description ?? "",
            startDate: toDateInputValue(task.startDate),
            endDate:
                toDateInputValue(task.endDate) ||
                estimateWorkEndDate(
                    toDateInputValue(task.startDate),
                    task.todos.reduce((sum, todo) => sum + todo.hours, 0)
                ),
            todos: task.todos.map((todo) => ({
                ...todo,
                finishedAt: todo.finishedAt
                    ? new Date(todo.finishedAt).toISOString()
                    : null,
            })),
            logs: task.logs ?? [],
        });
        setTaskFormError(null);
        setContractPanelView("edit-task");
    };

    const updateTaskEditForm = (
        update: (current: TaskEditForm) => TaskEditForm
    ) =>
        setTaskEditForm((current) => {
            const updated = update(current);
            return {
                ...updated,
                endDate:
                    updated.todos.reduce((sum, todo) => sum + todo.hours, 0) >
                    0
                        ? estimateWorkEndDate(
                              updated.startDate,
                              updated.todos.reduce(
                                  (sum, todo) => sum + todo.hours,
                                  0
                              )
                          )
                        : updated.endDate,
            };
        });

    const saveTaskChanges = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!activeTask || !activeProject || !selectedContractId) return;
        if (
            !taskEditForm.title.trim() ||
            taskEditForm.todos.some(
                (todo) =>
                    !todo.title.trim() ||
                    !Number.isFinite(todo.hours) ||
                    todo.hours < 0
            ) ||
            taskEditForm.logs.some(
                (log) =>
                    !log.collaboratorId ||
                    !log.entry.trim() ||
                    Number.isNaN(new Date(log.date).getTime())
            )
        ) {
            setTaskFormError("Completa el título de la tarea y sus tareas TODO.");
            return;
        }

        setIsSavingTask(true);
        setTaskFormError(null);
        const totalHours = taskEditForm.todos.reduce(
            (sum, todo) => sum + todo.hours,
            0
        );
        try {
            const response = await fetch(
                `/api/tasks/${encodeURIComponent(activeTask.id)}`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: taskEditForm.title.trim(),
                        taskType: Number(taskEditForm.taskType),
                        status: Number(taskEditForm.status),
                        assignedTo: taskEditForm.assignedTo || null,
                        description: taskEditForm.description.trim(),
                        startDate: taskEditForm.startDate
                            ? new Date(
                                  `${taskEditForm.startDate}T08:00:00`
                              ).toISOString()
                            : null,
                        endDate: taskEditForm.endDate
                            ? new Date(
                                  `${taskEditForm.endDate}T08:00:00`
                              ).toISOString()
                            : null,
                        todos: taskEditForm.todos,
                        logs: taskEditForm.logs,
                        weight: totalHours,
                        estimatedWeight: totalHours,
                    }),
                }
            );
            const result = (await response.json()) as { error?: string };
            if (!response.ok) {
                throw new Error(result.error || "No se pudo guardar la tarea.");
            }
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["project-tasks", activeProject.id],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["contract-projects", selectedContractId],
                }),
                queryClient.invalidateQueries({ queryKey: ["panel-data"] }),
            ]);
            setContractPanelView("tasks");
        } catch (error) {
            setTaskFormError(
                error instanceof Error
                    ? error.message
                    : "Ocurrió un error al guardar la tarea."
            );
        } finally {
            setIsSavingTask(false);
        }
    };

    useEffect(() => {
        if (!isCreateDialogOpen) return;

        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !isSaving) {
                setIsCreateDialogOpen(false);
                setFormError(null);
            }
        };

        window.addEventListener("keydown", closeOnEscape);
        return () => window.removeEventListener("keydown", closeOnEscape);
    }, [isCreateDialogOpen, isSaving]);

    const openCreateDialog = () => {
        if (!clientPendingGraphRefresh) {
            setForm(INITIAL_CLIENT_FORM);
        }
        setFormError(
            clientPendingGraphRefresh
                ? "El cliente ya se guardó. Reintenta actualizar el grafo."
                : null
        );
        setIsCreateDialogOpen(true);
    };

    const closeCreateDialog = () => {
        if (isSaving) return;
        setIsCreateDialogOpen(false);
        setFormError(null);
    };

    const updateFormField = (field: keyof NewClientForm, value: string) => {
        setForm((current) => ({ ...current, [field]: value }));
    };

    const handleCreateClient = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!clientPendingGraphRefresh && !form.name.trim()) {
            setFormError("El nombre del cliente es obligatorio.");
            return;
        }

        setIsSaving(true);
        setFormError(null);

        try {
            let clientId = clientPendingGraphRefresh;
            if (!clientId) {
                const response = await fetch("/api/clients", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...form,
                        name: form.name.trim(),
                    }),
                });
                const result = (await response.json()) as {
                    clientId?: string;
                    error?: string;
                    message?: string;
                };

                if (!response.ok || !result.clientId) {
                    throw new Error(
                        result.error ||
                            result.message ||
                            "No se pudo guardar el cliente."
                    );
                }

                clientId = result.clientId;
                setClientPendingGraphRefresh(clientId);
            }

            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["panel-data"],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["client-preferences"],
                }),
            ]);

            const refreshedData =
                queryClient.getQueryData<DashboardResponse>([
                    "panel-data",
                    includeArchivedClients,
                ]);
            if (
                !refreshedData?.clients.some(
                    (client) => client.id === clientId
                )
            ) {
                setFormError(
                    "El cliente ya se guardó, pero el grafo no pudo actualizarse. Puedes reintentar sin crear un duplicado."
                );
                return;
            }

            selectClient(clientId);
            setIsCreateDialogOpen(false);
            setForm(INITIAL_CLIENT_FORM);
            setClientPendingGraphRefresh(null);
        } catch (error) {
            setFormError(
                error instanceof Error
                    ? error.message
                    : "Ocurrió un error al guardar el cliente."
            );
        } finally {
            setIsSaving(false);
        }
    };

    const updateClientArchiveStatus = async (
        client: DashboardClient,
        archived: boolean
    ) => {
        setUpdatingArchiveClientId(client.id);
        setArchiveError(null);

        try {
            const response = await fetch(
                `/api/clients/${encodeURIComponent(client.id)}/preferences`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ archived }),
                }
            );
            const result = (await response.json()) as {
                error?: string;
                preferences?: { archived?: boolean };
            };
            const updatedPreferences = result.preferences;
            const updatedArchived = updatedPreferences?.archived;

            if (
                !response.ok ||
                typeof updatedArchived !== "boolean"
            ) {
                throw new Error(
                    result.error || "No se pudo actualizar el cliente."
                );
            }

            queryClient.setQueryData<ClientPreferencesResponse>(
                ["client-preferences"],
                (current) =>
                    current
                        ? {
                              ...current,
                              preferencesByClientId: {
                                  ...current.preferencesByClientId,
                                  [client.id]: {
                                      archived: updatedArchived,
                                  },
                              },
                          }
                        : current
            );
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: ["client-preferences"],
                }),
                queryClient.invalidateQueries({
                    queryKey: ["panel-data"],
                }),
            ]);
            setArchiveConfirmationClientId(null);
            setArchiveConfirmationChecked(false);
            onClientStatusChanged();
        } catch (updateError) {
            setArchiveConfirmationChecked(false);
            setArchiveError(
                updateError instanceof Error
                    ? updateError.message
                    : "Ocurrió un error al actualizar el cliente."
            );
        } finally {
            setUpdatingArchiveClientId(null);
        }
    };

    const renderClientDetails = (client: DashboardClient) => (
        <>
            <p className="control-panel-kicker">Cliente</p>
            <h2 className="control-panel-title">{client.name}</h2>
            {client.archived && (
                <p className="control-panel-archived-status">
                    Cliente archivado
                </p>
            )}
            {getClientImageSrc(client.logo) && (
                <img
                    className="control-panel-client-logo"
                    src={getClientImageSrc(client.logo)}
                    alt={`Logo de ${client.name}`}
                />
            )}
            <div className="control-panel-metrics">
                <div>
                    <span>Salud</span>
                    <strong>{client.health}%</strong>
                </div>
                <div>
                    <span>Ingresos</span>
                    <strong>{client.revenue.toLocaleString("es-CL")}</strong>
                </div>
                <div>
                    <span>Crecimiento</span>
                    <strong>{client.growth}%</strong>
                </div>
            </div>
            <section className="control-panel-section">
                <h3>Alertas</h3>
                {client.alerts.length > 0 ? (
                    <ul>
                        {client.alerts.map((alert) => (
                            <li key={alert}>{alert.replaceAll("_", " ")}</li>
                        ))}
                    </ul>
                ) : (
                    <p>Sin alertas activas.</p>
                )}
            </section>
            <section className="control-panel-section">
                <div className="control-panel-contract-heading">
                    <h3>Contratos ({client.contracts.length})</h3>
                    <button
                        className="control-panel-primary-button control-panel-contract-add"
                        type="button"
                        onClick={() =>
                            router.push(
                                `/homeneo/contratos/edicion?clientId=${encodeURIComponent(client.id)}`
                            )
                        }
                    >
                        NUEVO CONTRATO
                    </button>
                </div>
                {client.contracts.length > 0 ? (
                    <div className="control-panel-list">
                        {client.contracts.map((contract) => (
                            <button
                                className="control-panel-list-item"
                                key={contract.id}
                                type="button"
                                onClick={() =>
                                    selectContract(contract.id, client.id)
                                }
                            >
                                <span>{contract.name}</span>
                                <span>
                                    {contractStatusLabels[contract.status]} ·{" "}
                                    {contract.profitability == null
                                        ? "Rentabilidad no disponible"
                                        : `${contract.profitability}%`}
                                </span>
                            </button>
                        ))}
                    </div>
                ) : (
                    <p>Este cliente aún no tiene contratos.</p>
                )}
            </section>
            {client.archived ? (
                <button
                    className="control-panel-secondary-button control-panel-archive-action"
                    disabled={updatingArchiveClientId === client.id}
                    onClick={() =>
                        void updateClientArchiveStatus(client, false)
                    }
                    type="button"
                >
                    {updatingArchiveClientId === client.id
                        ? "Restaurando..."
                        : "Restaurar cliente"}
                </button>
            ) : archiveConfirmationClientId === client.id ? (
                <div className="control-panel-archive-confirm">
                    <label className="control-panel-switch">
                        <span>Confirma deslizando el interruptor</span>
                        <input
                            checked={archiveConfirmationChecked}
                            disabled={updatingArchiveClientId === client.id}
                            onChange={(event) => {
                                setArchiveConfirmationChecked(
                                    event.target.checked
                                );
                                if (event.target.checked) {
                                    void updateClientArchiveStatus(
                                        client,
                                        true
                                    );
                                }
                            }}
                            role="switch"
                            type="checkbox"
                        />
                        <span className="control-panel-switch-track" />
                    </label>
                    <button
                        aria-label="Cancelar archivado"
                        className="control-panel-archive-cancel"
                        disabled={updatingArchiveClientId === client.id}
                        onClick={() => {
                            setArchiveConfirmationClientId(null);
                            setArchiveConfirmationChecked(false);
                            setArchiveError(null);
                        }}
                        type="button"
                    >
                        ×
                    </button>
                </div>
            ) : (
                <button
                    className="control-panel-secondary-button control-panel-archive-action"
                    onClick={() => {
                        setArchiveConfirmationClientId(client.id);
                        setArchiveConfirmationChecked(false);
                        setArchiveError(null);
                    }}
                    type="button"
                >
                    Archivar
                </button>
            )}
            {archiveError && (
                <p className="control-panel-archive-error" role="alert">
                    {archiveError}
                </p>
            )}
        </>
    );

    return (
        <>
            <aside
                className={`control-panel${isVisible ? " is-visible" : ""}`}
                aria-hidden={!isVisible}
                aria-label="Información del nodo"
                inert={!isVisible}
            >
                <button
                    aria-label="Cerrar panel"
                    className="control-panel-panel-close"
                    disabled={isSaving || isWorkflowSaving}
                    onClick={() => {
                        if (isSaving || isWorkflowSaving) return;
                        setIsCreateDialogOpen(false);
                        onClose();
                    }}
                    type="button"
                >
                    ×
                </button>
                <div
                    className={`control-panel-content${
                        contractPanelView === "edit-task" ? " is-task-editor" : ""
                    }`}
                >
                    {selectedContract &&
                    selectedClient &&
                    contractPanelView !== "details" ? (
                        <>
                            <button
                                className="control-panel-secondary-button"
                                type="button"
                                onClick={() => {
                                    if (contractPanelView === "projects") {
                                        setContractPanelView("details");
                                    } else if (
                                        contractPanelView === "project"
                                    ) {
                                        setContractPanelView("projects");
                                    } else if (
                                        contractPanelView === "new-project"
                                    ) {
                                        setContractPanelView("projects");
                                    } else if (
                                        contractPanelView === "edit-project" ||
                                        contractPanelView === "tasks" ||
                                        contractPanelView === "sprints"
                                    ) {
                                        setContractPanelView("project");
                                    } else if (
                                        contractPanelView === "new-task" ||
                                        contractPanelView === "edit-task"
                                    ) {
                                        setContractPanelView("tasks");
                                    } else {
                                        setContractPanelView("project");
                                    }
                                    setProjectFormError(null);
                                    setTaskFormError(null);
                                }}
                            >
                                ← Volver
                            </button>
                            {contractPanelView === "projects" ? (
                                <>
                                    <p className="control-panel-kicker">
                                        {selectedContract.name}
                                    </p>
                                    <h2 className="control-panel-title">
                                        Proyectos
                                    </h2>
                                    <button
                                        className="control-panel-primary-button control-panel-workflow-add"
                                        onClick={openNewProject}
                                        type="button"
                                    >
                                        Agregar proyecto
                                    </button>
                                    {areProjectsLoading ? (
                                        <p
                                            className="control-panel-copy"
                                            role="status"
                                        >
                                            Cargando proyectos...
                                        </p>
                                    ) : projectsError ? (
                                        <p
                                            className="control-panel-archive-error"
                                            role="alert"
                                        >
                                            {projectsError instanceof Error
                                                ? projectsError.message
                                                : "No se pudieron cargar los proyectos."}
                                        </p>
                                    ) : contractProjects?.projects.length ? (
                                        <div className="control-panel-list">
                                            {contractProjects.projects.map(
                                                (project) => (
                                                    <button
                                                        className="control-panel-list-item"
                                                        key={project.id}
                                                        type="button"
                                                        onClick={() =>
                                                            showProjectDetails(
                                                                project
                                                            )
                                                        }
                                                    >
                                                        <span>
                                                            {project.title}
                                                        </span>
                                                        <span>
                                                            {PROJECT_TYPE_LABELS[
                                                                project
                                                                    .projectType
                                                            ] ??
                                                                "Proyecto"}{" "}
                                                            ·{" "}
                                                            {PROJECT_STATUS_LABELS[
                                                                project.status
                                                            ] ??
                                                                "Sin estado"}{" "}
                                                            ·{" "}
                                                            {Math.round(
                                                                project.progress
                                                            )}
                                                            % progreso ·{" "}
                                                            {project.rentability}
                                                            % rentabilidad
                                                        </span>
                                                    </button>
                                                )
                                            )}
                                        </div>
                                    ) : (
                                        <p className="control-panel-copy">
                                            Este contrato aún no tiene proyectos
                                            activos.
                                        </p>
                                    )}
                                </>
                            ) : contractPanelView === "new-project" ? (
                                <>
                                    <p className="control-panel-kicker">
                                        {selectedContract.name}
                                    </p>
                                    <h2 className="control-panel-title">
                                        Nuevo proyecto
                                    </h2>
                                    <form
                                        className="control-panel-form control-panel-inline-form"
                                        onSubmit={saveProject}
                                    >
                                        <label className="control-panel-field control-panel-field-wide">
                                            <span>Título *</span>
                                            <input
                                                onChange={(event) =>
                                                    setProjectForm(
                                                        (current) => ({
                                                            ...current,
                                                            title: event.target
                                                                .value,
                                                        })
                                                    )
                                                }
                                                required
                                                value={projectForm.title}
                                            />
                                        </label>
                                        <label className="control-panel-field">
                                            <span>Tipo</span>
                                            <select
                                                onChange={(event) =>
                                                    setProjectForm(
                                                        (current) => ({
                                                            ...current,
                                                            projectType:
                                                                event.target
                                                                    .value,
                                                        })
                                                    )
                                                }
                                                value={projectForm.projectType}
                                            >
                                                {Object.entries(
                                                    PROJECT_TYPE_LABELS
                                                ).map(([value, label]) => (
                                                    <option
                                                        key={value}
                                                        value={value}
                                                    >
                                                        {label}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                        <label className="control-panel-field">
                                            <span>Estado</span>
                                            <select
                                                onChange={(event) =>
                                                    setProjectForm(
                                                        (current) => ({
                                                            ...current,
                                                            status: event.target
                                                                .value,
                                                        })
                                                    )
                                                }
                                                value={projectForm.status}
                                            >
                                                {Object.entries(
                                                    PROJECT_STATUS_LABELS
                                                ).map(([value, label]) => (
                                                    <option
                                                        key={value}
                                                        value={value}
                                                    >
                                                        {label}
                                                    </option>
                                                ))}
                                            </select>
                                        </label>
                                        <label className="control-panel-field control-panel-field-wide">
                                            <span>Fecha de inicio *</span>
                                            <input
                                                onChange={(event) =>
                                                    setProjectForm(
                                                        (current) => ({
                                                            ...current,
                                                            kickOff:
                                                                event.target
                                                                    .value,
                                                        })
                                                    )
                                                }
                                                required
                                                type="date"
                                                value={projectForm.kickOff}
                                            />
                                        </label>
                                        {projectFormError && (
                                            <p
                                                className="control-panel-form-error"
                                                role="alert"
                                            >
                                                {projectFormError}
                                            </p>
                                        )}
                                        <div className="control-panel-form-actions">
                                            <button
                                                className="control-panel-primary-button"
                                                disabled={isSavingProject}
                                                type="submit"
                                            >
                                                {isSavingProject
                                                    ? "Guardando..."
                                                    : "Crear proyecto"}
                                            </button>
                                        </div>
                                    </form>
                                </>
                            ) : activeProject ? (
                                contractPanelView === "project" ? (
                                    <section
                                        className="contract-summary-card project-summary-card"
                                        aria-label="Resumen del proyecto"
                                    >
                                        <p className="control-panel-kicker">
                                            Proyecto · #
                                            {activeProject.identifier}
                                        </p>
                                        <div className="project-summary-heading">
                                            <div className="project-summary-title">
                                                <h2>
                                                    {activeProject.title}
                                                </h2>
                                                <span className="project-type-chip">
                                                    {PROJECT_TYPE_LABELS[
                                                        activeProject.projectType
                                                    ] ?? "Proyecto"}
                                                </span>
                                            </div>
                                            <span
                                                className={`contract-status-indicator${activeProject.status === 1 ? " is-active" : ""}`}
                                            >
                                                <span aria-hidden="true" />
                                                {PROJECT_STATUS_LABELS[
                                                    activeProject.status
                                                ] ?? "Sin estado"}
                                            </span>
                                        </div>
                                        <div className="project-summary-start">
                                            <div>
                                                <span>Inicio</span>
                                                <strong>
                                                    {activeProject.kickOff
                                                        ? new Date(
                                                              activeProject.kickOff
                                                          ).toLocaleDateString(
                                                              "es-CL"
                                                          )
                                                        : "Sin fecha"}
                                                </strong>
                                            </div>
                                            <button
                                                className="project-summary-edit"
                                                type="button"
                                                aria-label="Editar proyecto"
                                                title="Editar proyecto"
                                                onClick={() =>
                                                    openProjectEditor(
                                                        activeProject
                                                    )
                                                }
                                            >
                                                <RiPencilLine aria-hidden="true" />
                                            </button>
                                        </div>
                                        <div className="project-summary-performance">
                                            <div className="contract-project-progress">
                                                <svg
                                                    className="contract-progress-ring"
                                                    viewBox="0 0 36 36"
                                                    role="img"
                                                    aria-label={`Progreso del proyecto ${Math.round(Math.min(100, Math.max(0, activeProject.progress)))}%`}
                                                >
                                                    <circle
                                                        className="contract-progress-track"
                                                        cx="18"
                                                        cy="18"
                                                        r="15.9155"
                                                        pathLength="100"
                                                    />
                                                    <circle
                                                        className="contract-progress-value"
                                                        cx="18"
                                                        cy="18"
                                                        r="15.9155"
                                                        pathLength="100"
                                                        strokeDasharray={`${Math.min(100, Math.max(0, activeProject.progress))} 100`}
                                                    />
                                                    <text
                                                        x="18"
                                                        y="18"
                                                        className="contract-progress-label"
                                                    >
                                                        {Math.round(
                                                            Math.min(
                                                                100,
                                                                Math.max(
                                                                    0,
                                                                    activeProject.progress
                                                                )
                                                            )
                                                        )}
                                                        %
                                                    </text>
                                                </svg>
                                                <div className="contract-project-task-counts">
                                                    <strong>Progreso</strong>
                                                    <span>del proyecto</span>
                                                </div>
                                            </div>
                                            <div className="project-summary-profitability">
                                                <span>Rentabilidad</span>
                                                <strong>
                                                    {activeProject.rentability}%
                                                </strong>
                                            </div>
                                        </div>
                                        <div className="contract-project-actions">
                                            <button
                                                className="control-panel-secondary-button contract-project-action"
                                                type="button"
                                                onClick={() =>
                                                    setContractPanelView(
                                                        "tasks"
                                                    )
                                                }
                                            >
                                                VER TAREAS
                                            </button>
                                            <button
                                                className="control-panel-secondary-button contract-project-action"
                                                type="button"
                                                onClick={() =>
                                                    setContractPanelView(
                                                        "sprints"
                                                    )
                                                }
                                            >
                                                VER SPRINTS
                                            </button>
                                        </div>
                                    </section>
                                ) : contractPanelView === "edit-project" ? (
                                    <>
                                        <p className="control-panel-kicker">
                                            Editar proyecto
                                        </p>
                                        <h2 className="control-panel-title">
                                            {activeProject.title}
                                        </h2>
                                        <form
                                            className="control-panel-form control-panel-inline-form"
                                            onSubmit={saveProject}
                                        >
                                            <label className="control-panel-field control-panel-field-wide">
                                                <span>Título *</span>
                                                <input
                                                    onChange={(event) =>
                                                        setProjectForm(
                                                            (current) => ({
                                                                ...current,
                                                                title: event
                                                                    .target
                                                                    .value,
                                                            })
                                                        )
                                                    }
                                                    required
                                                    value={projectForm.title}
                                                />
                                            </label>
                                            <label className="control-panel-field">
                                                <span>Tipo</span>
                                                <select
                                                    onChange={(event) =>
                                                        setProjectForm(
                                                            (current) => ({
                                                                ...current,
                                                                projectType:
                                                                    event.target
                                                                        .value,
                                                            })
                                                        )
                                                    }
                                                    value={
                                                        projectForm.projectType
                                                    }
                                                >
                                                    {Object.entries(
                                                        PROJECT_TYPE_LABELS
                                                    ).map(([value, label]) => (
                                                        <option
                                                            key={value}
                                                            value={value}
                                                        >
                                                            {label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </label>
                                            <label className="control-panel-field">
                                                <span>Estado</span>
                                                <select
                                                    onChange={(event) =>
                                                        setProjectForm(
                                                            (current) => ({
                                                                ...current,
                                                                status: event
                                                                    .target
                                                                    .value,
                                                            })
                                                        )
                                                    }
                                                    value={projectForm.status}
                                                >
                                                    {Object.entries(
                                                        PROJECT_STATUS_LABELS
                                                    ).map(([value, label]) => (
                                                        <option
                                                            key={value}
                                                            value={value}
                                                        >
                                                            {label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </label>
                                            <label className="control-panel-field control-panel-field-wide">
                                                <span>Fecha de inicio</span>
                                                <input
                                                    onChange={(event) =>
                                                        setProjectForm(
                                                            (current) => ({
                                                                ...current,
                                                                kickOff:
                                                                    event.target
                                                                        .value,
                                                            })
                                                        )
                                                    }
                                                    required
                                                    type="date"
                                                    value={projectForm.kickOff}
                                                />
                                            </label>
                                            {projectFormError && (
                                                <p
                                                    className="control-panel-form-error"
                                                    role="alert"
                                                >
                                                    {projectFormError}
                                                </p>
                                            )}
                                            <div className="control-panel-form-actions">
                                                <button
                                                    className="control-panel-primary-button"
                                                    disabled={
                                                        isSavingProject
                                                    }
                                                    type="submit"
                                                >
                                                    {isSavingProject
                                                        ? "Guardando..."
                                                        : "Guardar proyecto"}
                                                </button>
                                            </div>
                                        </form>
                                    </>
                                ) : contractPanelView === "tasks" ||
                                  contractPanelView === "sprints" ||
                                  contractPanelView === "edit-task" ? (
                                    <ProjectWorkflowPanel
                                        error={
                                            tasksError instanceof Error
                                                ? tasksError.message
                                                : null
                                        }
                                        isLoading={areTasksLoading}
                                        isSaving={isSavingTask}
                                        onAddTask={() => {
                                            setTaskForm(INITIAL_TASK_FORM);
                                            setTaskFormError(null);
                                            setContractPanelView("new-task");
                                        }}
                                        onEditTask={openTaskEditor}
                                        onSaveTask={saveTaskChanges}
                                        onTaskFormChange={updateTaskEditForm}
                                        project={activeProject}
                                        sprints={sprintCards}
                                        taskForm={taskEditForm}
                                        tasks={projectTasks?.tasks ?? []}
                                        users={taskUsers?.users ?? []}
                                        view={contractPanelView}
                                    />
                                ) : (
                                    <>
                                        <p className="control-panel-kicker">
                                            Nueva tarea
                                        </p>
                                        <h2 className="control-panel-title">
                                            {activeProject.title}
                                        </h2>
                                        <form
                                            className="control-panel-form control-panel-inline-form"
                                            onSubmit={saveTask}
                                        >
                                            <label className="control-panel-field control-panel-field-wide">
                                                <span>Título *</span>
                                                <input
                                                    onChange={(event) =>
                                                        setTaskForm(
                                                            (current) => ({
                                                                ...current,
                                                                title: event
                                                                    .target
                                                                    .value,
                                                            })
                                                        )
                                                    }
                                                    required
                                                    value={taskForm.title}
                                                />
                                            </label>
                                            <label className="control-panel-field">
                                                <span>Tipo</span>
                                                <select
                                                    onChange={(event) =>
                                                        setTaskForm(
                                                            (current) => ({
                                                                ...current,
                                                                taskType:
                                                                    event.target
                                                                        .value,
                                                            })
                                                        )
                                                    }
                                                    value={taskForm.taskType}
                                                >
                                                    {TASK_TYPE_OPTIONS.map(
                                                        (option) => (
                                                            <option
                                                                key={
                                                                    option.value
                                                                }
                                                                value={
                                                                    option.value
                                                                }
                                                            >
                                                                {option.label}
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </label>
                                            <label className="control-panel-field">
                                                <span>Estado</span>
                                                <select
                                                    onChange={(event) =>
                                                        setTaskForm(
                                                            (current) => ({
                                                                ...current,
                                                                status: event
                                                                    .target
                                                                    .value,
                                                            })
                                                        )
                                                    }
                                                    value={taskForm.status}
                                                >
                                                    {TASK_STATUS_OPTIONS.map(
                                                        (option) => (
                                                            <option
                                                                key={
                                                                    option.value
                                                                }
                                                                value={
                                                                    option.value
                                                                }
                                                            >
                                                                {option.label}
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </label>
                                            <label className="control-panel-field control-panel-field-wide">
                                                <span>Asignado a</span>
                                                <select
                                                    onChange={(event) =>
                                                        setTaskForm(
                                                            (current) => ({
                                                                ...current,
                                                                assignedTo:
                                                                    event.target
                                                                        .value,
                                                            })
                                                        )
                                                    }
                                                    value={taskForm.assignedTo}
                                                >
                                                    <option value="">
                                                        Sin asignar
                                                    </option>
                                                    {taskUsers?.users.map(
                                                        (user) => (
                                                            <option
                                                                key={user.id}
                                                                value={user.id}
                                                            >
                                                                {user.name}
                                                            </option>
                                                        )
                                                    )}
                                                </select>
                                            </label>
                                            <label className="control-panel-field">
                                                <span>Fecha de inicio</span>
                                                <input
                                                    onChange={(event) =>
                                                        setTaskForm(
                                                            (current) => ({
                                                                ...current,
                                                                startDate:
                                                                    event.target
                                                                        .value,
                                                            })
                                                        )
                                                    }
                                                    required
                                                    type="date"
                                                    value={taskForm.startDate}
                                                />
                                            </label>
                                            <label className="control-panel-field">
                                                <span>Fecha estimada de término</span>
                                                <input
                                                    readOnly
                                                    type="date"
                                                    value={estimateWorkEndDate(
                                                        taskForm.startDate,
                                                        taskForm.todos.length
                                                            ? taskForm.todos.reduce(
                                                                  (sum, todo) =>
                                                                      sum +
                                                                      todo.hours,
                                                                  0
                                                              )
                                                            : Number(
                                                                  taskForm.weight
                                                              )
                                                    )}
                                                />
                                            </label>
                                            <section className="control-panel-field control-panel-field-wide control-panel-todos">
                                                <div className="control-panel-contract-heading">
                                                    <span>TODOs del proyecto</span>
                                                    <button
                                                        className="control-panel-secondary-button control-panel-contract-add"
                                                        onClick={() =>
                                                            setTaskForm(
                                                                (current) => ({
                                                                    ...current,
                                                                    todos: [
                                                                        ...current.todos,
                                                                        {
                                                                            title: "",
                                                                            hours: 0,
                                                                            finishedAt:
                                                                                null,
                                                                        },
                                                                    ],
                                                                })
                                                            )
                                                        }
                                                        type="button"
                                                    >
                                                        Agregar TODO
                                                    </button>
                                                </div>
                                                {taskForm.todos.map(
                                                    (todo, index) => (
                                                        <div
                                                            className="control-panel-todo-row"
                                                            key={index}
                                                        >
                                                            <input
                                                                aria-label="Título del TODO"
                                                                onChange={(
                                                                    event
                                                                ) =>
                                                                    setTaskForm(
                                                                        (
                                                                            current
                                                                        ) => ({
                                                                            ...current,
                                                                            todos: current.todos.map(
                                                                                (
                                                                                    item,
                                                                                    itemIndex
                                                                                ) =>
                                                                                    itemIndex ===
                                                                                    index
                                                                                        ? {
                                                                                              ...item,
                                                                                              title: event
                                                                                                  .target
                                                                                                  .value,
                                                                                          }
                                                                                        : item
                                                                            ),
                                                                        })
                                                                    )
                                                                }
                                                                required
                                                                value={
                                                                    todo.title
                                                                }
                                                            />
                                                            <input
                                                                aria-label="Horas del TODO"
                                                                min="0"
                                                                onChange={(
                                                                    event
                                                                ) =>
                                                                    setTaskForm(
                                                                        (
                                                                            current
                                                                        ) => ({
                                                                            ...current,
                                                                            todos: current.todos.map(
                                                                                (
                                                                                    item,
                                                                                    itemIndex
                                                                                ) =>
                                                                                    itemIndex ===
                                                                                    index
                                                                                        ? {
                                                                                              ...item,
                                                                                              hours: Number(
                                                                                                  event
                                                                                                      .target
                                                                                                      .value
                                                                                              ),
                                                                                          }
                                                                                        : item
                                                                            ),
                                                                        })
                                                                    )
                                                                }
                                                                required
                                                                step="0.5"
                                                                type="number"
                                                                value={
                                                                    todo.hours
                                                                }
                                                            />
                                                            <button
                                                                aria-label="Eliminar TODO"
                                                                className="control-panel-todo-remove"
                                                                onClick={() =>
                                                                    setTaskForm(
                                                                        (
                                                                            current
                                                                        ) => ({
                                                                            ...current,
                                                                            todos: current.todos.filter(
                                                                                (
                                                                                    _,
                                                                                    itemIndex
                                                                                ) =>
                                                                                    itemIndex !==
                                                                                    index
                                                                            ),
                                                                        })
                                                                    )
                                                                }
                                                                type="button"
                                                            >
                                                                ×
                                                            </button>
                                                        </div>
                                                    )
                                                )}
                                            </section>
                                            <label className="control-panel-field control-panel-field-wide">
                                                <span>
                                                    Horas estimadas *
                                                    {taskForm.todos.length > 0
                                                        ? " (calculadas desde TODOs)"
                                                        : ""}
                                                </span>
                                                <input
                                                    min="0"
                                                    onChange={(event) =>
                                                        setTaskForm(
                                                            (current) => ({
                                                                ...current,
                                                                weight: event
                                                                    .target
                                                                    .value,
                                                            })
                                                        )
                                                    }
                                                    required
                                                    step="0.5"
                                                    type="number"
                                                    value={taskForm.weight}
                                                />
                                            </label>
                                            <label className="control-panel-field control-panel-field-wide">
                                                <span>Descripción</span>
                                                <textarea
                                                    onChange={(event) =>
                                                        setTaskForm(
                                                            (current) => ({
                                                                ...current,
                                                                description:
                                                                    event.target
                                                                        .value,
                                                            })
                                                        )
                                                    }
                                                    rows={3}
                                                    value={
                                                        taskForm.description
                                                    }
                                                />
                                            </label>
                                            {taskFormError && (
                                                <p
                                                    className="control-panel-form-error"
                                                    role="alert"
                                                >
                                                    {taskFormError}
                                                </p>
                                            )}
                                            <div className="control-panel-form-actions">
                                                <button
                                                    className="control-panel-primary-button"
                                                    disabled={isSavingTask}
                                                    type="submit"
                                                >
                                                    {isSavingTask
                                                        ? "Creando..."
                                                        : "Crear tarea"}
                                                </button>
                                            </div>
                                        </form>
                                    </>
                                )
                            ) : (
                                <p className="control-panel-copy">
                                    No se encontró el proyecto seleccionado.
                                </p>
                            )}
                        </>
                    ) : selectedContract && selectedClient ? (
                        <>
                            <section className="contract-summary-card" aria-label="Resumen del contrato">
                                <p className="control-panel-kicker">Contrato · {selectedContract.name}</p>
                                <div className="contract-summary-client">
                                    <h2>{selectedClient.name}</h2>
                                    <div className="contract-summary-status">
                                        <div
                                            className="contract-notification-control"
                                            title={`${selectedContract.notificationCount} notificaciones`}
                                            aria-label={`${selectedContract.notificationCount} notificaciones`}
                                        >
                                            <FiBell aria-hidden="true" />
                                            <span className="contract-notification-badge">
                                                {selectedContract.notificationCount}
                                            </span>
                                        </div>
                                        <span
                                            className={`contract-status-indicator${selectedContract.status === "active" ? " is-active" : ""}`}
                                        >
                                            <span aria-hidden="true" />
                                            {selectedContract.status === "active" ? "Activo" : "No activo"}
                                        </span>
                                    </div>
                                </div>
                                <dl className="contract-summary-metrics">
                                    <div>
                                        <dt>Monto neto anual</dt>
                                        <dd>
                                            {selectedContract.currency} ${" "}
                                            {new Intl.NumberFormat("es-CL", {
                                                maximumFractionDigits: 1,
                                            }).format(selectedContract.netAmount / 1_000_000)}{" "}
                                            M
                                        </dd>
                                    </div>
                                    <div>
                                        <dt>Rentabilidad anual (margen)</dt>
                                        <dd>
                                            {selectedContract.profitability == null
                                                ? "No disponible"
                                                : `${new Intl.NumberFormat("es-CL", {
                                                      maximumFractionDigits: 1,
                                                  }).format(selectedContract.profitability)}%`}
                                        </dd>
                                    </div>
                                </dl>
                            </section>
                            <fieldset className="contract-projects-fieldset">
                                <legend>PROYECTOS</legend>
                                <div className="contract-latest-project">
                                    <div className="contract-latest-project-header">
                                        <p className="control-panel-kicker">
                                            Último proyecto activo
                                        </p>
                                        <button
                                            className="control-panel-secondary-button contract-project-action"
                                            type="button"
                                            onClick={showContractProjects}
                                        >
                                            VER TODOS
                                        </button>
                                    </div>
                                    {isLatestProjectLoading ? (
                                        <p className="control-panel-copy">
                                            Cargando proyecto...
                                        </p>
                                    ) : latestProjectError ? (
                                        <p
                                            className="control-panel-form-error"
                                            role="alert"
                                        >
                                            {latestProjectError instanceof Error
                                                ? latestProjectError.message
                                                : "No se pudo cargar el último proyecto activo."}
                                        </p>
                                    ) : latestActiveProject ? (
                                        <>
                                            <div className="contract-latest-project-heading">
                                                <h3>{latestActiveProject.title}</h3>
                                                <button
                                                    className="control-panel-secondary-button contract-project-action"
                                                    type="button"
                                                    aria-label={`Ver proyecto ${latestActiveProject.title}`}
                                                    title="Ver proyecto"
                                                    onClick={() =>
                                                        showProjectDetails(
                                                            latestActiveProject
                                                        )
                                                    }
                                                >
                                                    <FiEye aria-hidden="true" />
                                                    VER PROYECTO
                                                </button>
                                            </div>
                                            <div className="contract-project-progress">
                                                <svg
                                                    className="contract-progress-ring"
                                                    viewBox="0 0 36 36"
                                                    role="img"
                                                    aria-label={`Avance de TODOs ${latestActiveProject.progress}%`}
                                                >
                                                    <circle
                                                        className="contract-progress-track"
                                                        cx="18"
                                                        cy="18"
                                                        r="15.9155"
                                                        pathLength="100"
                                                    />
                                                    <circle
                                                        className="contract-progress-value"
                                                        cx="18"
                                                        cy="18"
                                                        r="15.9155"
                                                        pathLength="100"
                                                        strokeDasharray={`${latestActiveProject.progress} 100`}
                                                    />
                                                    <text
                                                        x="18"
                                                        y="18"
                                                        className="contract-progress-label"
                                                    >
                                                        {latestActiveProject.progress}%
                                                    </text>
                                                </svg>
                                                <div className="contract-project-task-counts">
                                                    <strong>
                                                        {latestActiveProject.completedTodos} /{" "}
                                                        {latestActiveProject.totalTodos}
                                                    </strong>
                                                    <span>TODOs resueltos</span>
                                                    <span>
                                                        {latestActiveProject.remainingTodos} faltantes
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="contract-project-actions">
                                                <button
                                                    className="control-panel-secondary-button contract-project-action"
                                                    type="button"
                                                    onClick={() => {
                                                        setActiveProjectId(
                                                            latestActiveProject.id
                                                        );
                                                        setContractPanelView(
                                                            "tasks"
                                                        );
                                                    }}
                                                >
                                                    VER TAREAS
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <p className="control-panel-copy">
                                            No hay proyectos activos en este contrato.
                                        </p>
                                    )}
                                </div>
                            </fieldset>
                        </>
                    ) : selectedClient ? (
                        renderClientDetails(selectedClient)
                    ) : (
                        <>
                            <p className="control-panel-kicker">Nodo central</p>
                            <h2 className="control-panel-title">
                                Centro de control
                            </h2>
                            <div className="control-panel-metrics">
                                <div>
                                    <span>Salud</span>
                                    <strong>
                                        {companyData.central.health}%
                                    </strong>
                                </div>
                                <div>
                                    <span>Eficiencia</span>
                                    <strong>
                                        {companyData.central.efficiency}%
                                    </strong>
                                </div>
                                <div>
                                    <span>Clientes</span>
                                    <strong>
                                        {companyData.clients.length}
                                    </strong>
                                </div>
                            </div>
                            <p className="control-panel-copy">
                                Selecciona un cliente del grafo para consultar
                                sus indicadores y contratos.
                            </p>
                            <label className="control-panel-archived-toggle">
                                <span>Mostrar clientes archivados</span>
                                <input
                                    checked={includeArchivedClients}
                                    onChange={(event) =>
                                        onToggleArchivedClients(
                                            event.target.checked
                                        )
                                    }
                                    role="switch"
                                    type="checkbox"
                                />
                                <span className="control-panel-switch-track" />
                            </label>
                            <button
                                className="control-panel-primary-button"
                                type="button"
                                onClick={openCreateDialog}
                            >
                                Agregar relación cliente
                            </button>
                        </>
                    )}
                </div>
            </aside>

            {isCreateDialogOpen && (
                <div
                    className="control-panel-modal-backdrop"
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeCreateDialog();
                        }
                    }}
                >
                    <section
                        className="control-panel-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="new-client-title"
                    >
                        <div className="control-panel-modal-content">
                            <div className="control-panel-modal-heading">
                                <div>
                                    <p className="control-panel-kicker">
                                        Nueva relación
                                    </p>
                                    <h2
                                        className="control-panel-title"
                                        id="new-client-title"
                                    >
                                        Agregar cliente
                                    </h2>
                                </div>
                                <button
                                    aria-label="Cerrar"
                                    className="control-panel-close-button"
                                    disabled={isSaving}
                                    onClick={closeCreateDialog}
                                    type="button"
                                >
                                    ×
                                </button>
                            </div>
                            <form
                                className="control-panel-form"
                                onSubmit={handleCreateClient}
                            >
                                <label className="control-panel-field">
                                    <span>Nombre *</span>
                                    <input
                                        autoComplete="organization"
                                        onChange={(event) =>
                                            updateFormField(
                                                "name",
                                                event.target.value
                                            )
                                        }
                                        required
                                        value={form.name}
                                    />
                                </label>
                                <label className="control-panel-field">
                                    <span>Razón social</span>
                                    <input
                                        autoComplete="organization"
                                        onChange={(event) =>
                                            updateFormField(
                                                "completeName",
                                                event.target.value
                                            )
                                        }
                                        value={form.completeName}
                                    />
                                </label>
                                <label className="control-panel-field">
                                    <span>Tipo de identificación</span>
                                    <select
                                        onChange={(event) =>
                                            updateFormField(
                                                "identificationType",
                                                event.target.value
                                            )
                                        }
                                        value={form.identificationType}
                                    >
                                        <option value="RUT">RUT</option>
                                        <option value="DNI">DNI</option>
                                        <option value="Pasaporte">
                                            Pasaporte
                                        </option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </label>
                                <label className="control-panel-field">
                                    <span>Número de identificación</span>
                                    <input
                                        onChange={(event) =>
                                            updateFormField(
                                                "identificationId",
                                                event.target.value
                                            )
                                        }
                                        value={form.identificationId}
                                    />
                                </label>
                                <label className="control-panel-field">
                                    <span>Correo electrónico</span>
                                    <input
                                        autoComplete="email"
                                        onChange={(event) =>
                                            updateFormField(
                                                "email",
                                                event.target.value
                                            )
                                        }
                                        type="email"
                                        value={form.email}
                                    />
                                </label>
                                <label className="control-panel-field">
                                    <span>Dirección</span>
                                    <input
                                        autoComplete="street-address"
                                        onChange={(event) =>
                                            updateFormField(
                                                "address",
                                                event.target.value
                                            )
                                        }
                                        value={form.address}
                                    />
                                </label>
                                <label className="control-panel-field control-panel-field-wide">
                                    <span>Imagen del cliente (ruta local)</span>
                                    <input
                                        onChange={(event) =>
                                            updateFormField(
                                                "imgLogo",
                                                event.target.value
                                            )
                                        }
                                        placeholder="./profiles/ms.png"
                                        type="text"
                                        value={form.imgLogo}
                                    />
                                    <span className="control-panel-field-hint">
                                        Indica una imagen guardada dentro de
                                        public, por ejemplo
                                        {" "}
                                        ./profiles/ms.png
                                    </span>
                                </label>
                                {formError && (
                                    <p
                                        className="control-panel-form-error"
                                        role="alert"
                                    >
                                        {formError}
                                    </p>
                                )}
                                <div className="control-panel-form-actions">
                                    <button
                                        className="control-panel-secondary-button"
                                        disabled={isSaving}
                                        onClick={closeCreateDialog}
                                        type="button"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        className="control-panel-primary-button"
                                        disabled={isSaving}
                                        type="submit"
                                    >
                                        {isSaving
                                            ? "Guardando..."
                                            : clientPendingGraphRefresh
                                              ? "Reintentar actualización"
                                            : "Guardar cliente"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </section>
                </div>
            )}
        </>
    );
}
