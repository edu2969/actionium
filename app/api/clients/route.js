import { connectMongoDB } from "@/lib/mongodb";
import Client from "@/models/client";
import { NextResponse } from "next/server";

export async function GET(request) {
    try {
        console.log("getAll Clients...");
        await connectMongoDB();
        const includeArchived =
            new URL(request.url).searchParams.get("archived") === "true";
        const clients = await Client.find({}).lean();
        return NextResponse.json({ clients: clients
            .filter(c => includeArchived || (c.preferences?.archived ?? c.archived) !== true)
            .map(c => {
            return {
                id: c._id.valueOf(),
                name: c.name,
                email: c.email,
                imgLogo: c.imgLogo,
                archived: (c.preferences?.archived ?? c.archived) === true,
            }
        }) });
    } catch (error) {
        console.error("Error fetching clients:", error);
        return NextResponse.json(
            { error: "Could not fetch clients." },
            { status: 500 }
        );
    }
}

export async function POST(req) {
    try {
        await connectMongoDB();
        const params = await req.json();
        console.log("Client POST", params);
        const res = await Client.create(params);
        return NextResponse.json({            
            clientId: res._id.valueOf()
        });
    } catch (error) {
        console.log("ERROR!", error);
        return NextResponse.json(error.message, {
            status: 404,
        })
    }
}