import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Project from "@/models/project";
import Task from "@/models/task";
import User from "@/models/user";
import { PROJECT_STATUS } from "@/app/utils/constants";

export async function GET(req) {
    await connectMongoDB();
    const url = new URL(req.url);
    const projectId = url.searchParams.get("projectId");    
    const project = await Project.findOne({ _id: projectId });
    const tasks = await Task.find({ projectId: projectId });    
    const decoratedTasks = await Promise.all(tasks.map(async (task) => {
        const client = await User.findOne({ _id: task.asignTo });
        var progress = task.todos?.length > 0 ? Math.round((task.todos.filter(todo => todo.finishedAt != null).length / task.todos.length) * 100) : 0;
        return {
            id: task._id,
            asignedToImg: client?.avatarImg ?? "/profiles/neo.jpg",
            identifier: task.identifier,
            priority: task.priority,
            taskType: task.taskType,
            title: task.title,
            status: task.status,
            weight: project.status === PROJECT_STATUS.defining ? task.estimatedWeight : task.weight,
            estimatedWeight: task.estimatedWeight,
            description: task.description ?? "",
            assignedTo: task.assignedTo?.toString() ?? "",
            startDate: task.startDate,
            endDate: task.endDate,
            progress: progress,
            updatedAt: task.updatedAt,
            todos: (task.todos ?? []).map(todo => ({
                title: todo.title,
                hours: todo.hours,
                finishedAt: todo.finishedAt ?? null,
            })),
            logs: (task.logs ?? []).map(log => ({
                collaboratorId: log.collaboratorId.toString(),
                date: log.date,
                entry: log.entry,
            })),
        };
    }));
    return NextResponse.json({ tasks: decoratedTasks });
}

export async function POST(req) {
    try {
        await connectMongoDB();
        const body = await req.json();
        if (
            !body ||
            typeof body.projectId !== "string" ||
            typeof body.title !== "string" ||
            !body.title.trim() ||
            !Number.isInteger(Number(body.taskType)) ||
            !Number.isInteger(Number(body.status))
        ) {
            return NextResponse.json(
                { error: "Project, title, task type, and status are required." },
                { status: 400 }
            );
        }

        const project = await Project.findById(body.projectId);
        if (!project) {
            return NextResponse.json(
                { error: "Project not found." },
                { status: 404 }
            );
        }

        const task = new Task({
            ...body,
            taskType: Number(body.taskType),
            status: Number(body.status),
        });
        task.priority = (await Task.countDocuments()) + 1;
        if(project.status === PROJECT_STATUS.defining) {
            task.estimatedWeight = task.weight;
        }
        task.createdAt = new Date();
        await task.save();
        return NextResponse.json(task, { status: 201 });
    } catch (error) {
        console.error("Error creating task:", error);
        return NextResponse.json(
            { error: "Could not create task." },
            { status: 500 }
        );
    }
}