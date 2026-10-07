import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectMongoDB } from "@/lib/mongodb";
import Project from "@/models/project";
import Task from "@/models/task";
import { PROJECT_STATUS } from "@/app/utils/constants";

export async function GET(_request, { params }) {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) {
        return NextResponse.json({ error: "Invalid contract id." }, { status: 400 });
    }

    try {
        await connectMongoDB();
        const project = await Project.findOne({
            contractId: id,
            status: PROJECT_STATUS.active,
        }).sort({ createdAt: -1, _id: -1 }).lean();

        if (!project) {
            return NextResponse.json({ project: null });
        }

        const tasks = await Task.find({ projectId: project._id })
            .select({ todos: 1 })
            .lean();
        const todos = tasks.flatMap((task) => task.todos ?? []);
        const completedTodos = todos.filter((todo) => todo.finishedAt != null).length;
        const totalTodos = todos.length;

        return NextResponse.json({
            project: {
                id: project._id.toString(),
                title: project.title,
                identifier: project.identifier,
                projectType: project.projectType,
                status: project.status,
                progress: totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0,
                rentability: project.rentability ?? 0,
                kickOff: project.kickOff ?? null,
                end: project.end ?? null,
                totalTodos,
                completedTodos,
                remainingTodos: totalTodos - completedTodos,
            },
        });
    } catch (error) {
        console.error("Error fetching latest active project for contract:", error);
        return NextResponse.json(
            { error: "Could not load the latest active project." },
            { status: 500 }
        );
    }
}
