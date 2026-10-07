import { connectMongoDB } from "@/lib/mongodb";
import Project from "@/models/project";
import Client from "@/models/client";
import Contract from "@/models/contract";
import Task from "@/models/task";
import { NextResponse } from "next/server";
import { auth } from "@/app/utils/auth";
import { authOptions } from "@/app/utils/authOptions";
import { PROJECT_STATUS, USER_ROLE } from "@/app/utils/constants";
import mongoose from "mongoose";

export async function GET(req) {
    const session = await auth();
    const userRole = session?.user?.role;
    const userId = session?.user?.id;
    const userClientId = session?.user?.clientId;

    if (!userRole) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const contractId = url.searchParams.get("contractId");
    const clientId = url.searchParams.get("clientId");
    console.log("getProjects by contractId", contractId);
    console.log("SESSION", session);
    await connectMongoDB();

    let query = {};
    if (userRole === USER_ROLE.neo) {
        if (contractId) {
            query = { contractId: new mongoose.Types.ObjectId(contractId), status: { $ne: PROJECT_STATUS.closed } };
        } else if (clientId) {
            const contracts = await Contract.find({ clientId: new mongoose.Types.ObjectId(clientId) });
            const contractIds = contracts.map(contract => contract._id);
            query = { contractId: { $in: contractIds }, status: { $ne: PROJECT_STATUS.closed } };
        } else {
            query = { status: { $ne: PROJECT_STATUS.closed } };
        }
    } else if (userRole === USER_ROLE.client) {
        const contracts = await Contract.find({ clientId: userClientId });
        const contractIds = contracts.map(contract => contract._id);
        query = { contractId: { $in: contractIds }, status: { $ne: PROJECT_STATUS.closed } };
    } else if (contractId) {
        query = { contractId: new mongoose.Types.ObjectId(contractId), status: { $ne: PROJECT_STATUS.closed } };
    } else if (clientId) {
        const contracts = await Contract.find({ clientId: new mongoose.Types.ObjectId(clientId) });
        const contractIds = contracts.map(contract => contract._id);
        query = { contractId: { $in: contractIds }, status: { $ne: PROJECT_STATUS.closed } };
    } else {
        query = { status: { $ne: PROJECT_STATUS.closed } };
    }

    console.log("QUERY", query);

    const projects = await Project.find(query);
    const decoratedProjects = await Promise.all(projects.map(async (project) => {
        const contract = await Contract.findById(project.contractId);
        const client = await Client.findById(contract?.clientId);
        const tasks = await Task.find({ projectId: project._id });
        return {
            id: project._id,
            identifier: project.identifier,
            clientImg: client?.imgLogo ?? '',
            clientName: client?.name ?? '',
            contractId: project.contractId,
            projectType: project.projectType,
            title: project.title,
            status: project.status,
            kickOff: project.kickOff ?? null,
            end: project.end,
            progress: tasks.length > 0 ? tasks.reduce((acc, task) => acc + (task.progress ?? 0), 0) / tasks.length : 0,
            rentability: project.rentability ?? 0,
        };
    }));
    return NextResponse.json({ projects: decoratedProjects });
}

export async function POST(req) {
    try {
        await connectMongoDB();
        const body = await req.json();
        if (
            !body ||
            typeof body.contractId !== "string" ||
            !mongoose.isValidObjectId(body.contractId) ||
            typeof body.title !== "string" ||
            !body.title.trim() ||
            !Number.isInteger(Number(body.projectType)) ||
            !Number.isInteger(Number(body.status)) ||
            !body.kickOff ||
            Number.isNaN(new Date(body.kickOff).getTime())
        ) {
            return NextResponse.json(
                { error: "Contract, title, project type, status, and kickoff are required." },
                { status: 400 }
            );
        }

        const contract = await Contract.findById(body.contractId);
        if (!contract) {
            return NextResponse.json(
                { error: "Contract not found." },
                { status: 404 }
            );
        }

        const project = new Project({
            contractId: contract._id,
            title: body.title.trim(),
            projectType: Number(body.projectType),
            status: Number(body.status),
            kickOff: new Date(body.kickOff),
            end: body.end ? new Date(body.end) : undefined,
        });
        project.identifier = (await Project.countDocuments()) + 1;
        await project.save();
        return NextResponse.json(project, { status: 201 });
    } catch (error) {
        console.error("Error creating project:", error);
        return NextResponse.json(
            { error: "Could not create project." },
            { status: 500 }
        );
    }
}
