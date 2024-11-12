import { connectMongoDB } from "@/lib/mongodb";
import Project from "@/models/project";
import Client from "@/models/client";
import Contract from "@/models/contract";
import Task from "@/models/task";
import { NextResponse } from "next/server";

export async function GET(req) {
    const url = new URL(req.url);
    const contractId = url.searchParams.get("contractId");        
    console.log("getProjects by contractId", contractId);
    await connectMongoDB();
    const projects = await Project.find(contractId ? { contractId } : {});    
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
            kickOff: project.kickOff,
            end: project.end,
            progress: tasks.length > 0 ? tasks.reduce((acc, task) => acc + (task.progress ?? 0), 0) / tasks.length : 0,
            rentability: project.rentability ?? 0,
        };
    }));

    return NextResponse.json({ projects: decoratedProjects });
}

export async function POST(req) {
    const body = await req.json();
    console.log("Create Project...", body);    
    const project = new Project(body);    
    const projectCount = await Project.countDocuments();
    project.identifier = projectCount + 1;
    project.createdAt = new Date();
    await project.save();
    return NextResponse.json(project);
}
