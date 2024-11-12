import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import Project from "@/models/project";
import Sprint from "@/models/sprint";
import Task from "@/models/task";

export async function GET(req, { params }) {
    console.log("getSprints...", params);
    await connectMongoDB();
    const sprints = await Sprint.find({ projectId: params.projectId });
    
    const decoratedSprints = await Promise.all(sprints.map(async (sprint) => {
        const tasks = await Task.find({ sprintId: sprint._id });        
        return {
            id: sprint._id,
            clientImg: client?.imgLogo ?? '',
            clientName: client?.name ?? '',
            contractId: project.contractId,
            projectType: project.projectType,
            title: project.title,
            status: project.status,
            kickOff: project.kickOff,
            end: project.end,
        };
    }));

    return NextResponse.json({ sprints: decoratedSprints });
}

export async function POST(req) {
    const body = await req.json();
    console.log("Create Sprint...", body);    
    const project = new Project(body);    
    const projectCount = await Project.countDocuments();
    project.identifier = projectCount + 1;
    project.createdAt = new Date();
    await project.save();
    return NextResponse.json(project);
}
