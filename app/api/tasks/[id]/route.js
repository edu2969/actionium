import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import Task from "@/models/task";
import { TASK_STATUS } from "@/app/utils/constants";

export async function POST(req, { params }) {
    try {
        const { id } = await params;
        if (typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id)) {
            return NextResponse.json(
                { error: "Invalid task id." },
                { status: 400 }
            );
        }

        const body = await req.json();
        if (
            !body ||
            typeof body.title !== "string" ||
            !body.title.trim() ||
            !Number.isInteger(Number(body.taskType)) ||
            !Number.isInteger(Number(body.status)) ||
            !Array.isArray(body.todos)
        ) {
            return NextResponse.json(
                { error: "Title, task type, status, and TODO list are required." },
                { status: 400 }
            );
        }

        await connectMongoDB();
        const totalHours = body.todos.reduce(
            (sum, todo) =>
                sum +
                (Number.isFinite(Number(todo.hours))
                    ? Number(todo.hours)
                    : 0),
            0
        );
        const progress =
            body.todos.length > 0
                ? (body.todos.filter(todo => todo.finishedAt != null).length /
                      body.todos.length) *
                  100
                : 0;
        const resp = await Task.findByIdAndUpdate(
            id,
            {
                $set: {
                    title: body.title.trim(),
                    taskType: Number(body.taskType),
                    status: Number(body.status),
                    assignedTo: body.assignedTo || null,
                    description: body.description ?? "",
                    startDate: body.startDate ?? null,
                    endDate: body.endDate ?? null,
                    todos: body.todos,
                    logs: body.logs ?? [],
                    weight: totalHours,
                    estimatedWeight: totalHours,
                    progress,
                },
            },
            { new: true, runValidators: true }
        );
        return resp
            ? NextResponse.json(resp)
            : NextResponse.json({ error: "Task not found." }, { status: 404 });
    } catch (error) {
        console.error("Error updating task:", error);
        return NextResponse.json(
            { error: "Could not update task." },
            { status: 500 }
        );
    }
}

export async function GET(req, { params }) {
    await connectMongoDB();
    const { id } = await params;
    const task = await Task.findOne({ _id: id });
    return task
        ? NextResponse.json({ task })
        : NextResponse.json({ error: `Task ${id} not found.` }, { status: 404 });
}

export async function DELETE(req, { params }) {
    await connectMongoDB();
    const { id } = await params;

    try {
        const task = await Task.findByIdAndDelete(id);
        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }
        return NextResponse.json({ message: 'Task deleted successfully' }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}