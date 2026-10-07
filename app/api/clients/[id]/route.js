import { connectMongoDB } from "@/lib/mongodb";
import Client from "@/models/client";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    try {
        const { id } = await params;
        await connectMongoDB();
        const client = await Client.findById(id, { password: 0, __v: 0 });

        if (!client) {
            return NextResponse.json(
                { error: "Client not found." },
                { status: 404 }
            );
        }

        return NextResponse.json({ client });
    } catch (error) {
        console.error("Error fetching client:", error);
        return NextResponse.json(
            { error: "Could not fetch client." },
            { status: 500 }
        );
    }
}

export async function POST(req, { params }) {
    const body = await req.json();
    const { id } = await params;
    await connectMongoDB();
    const clientUpdated = await Client.findByIdAndUpdate(id, {
        name: body.name,
        completeName: body.completeName,
        identificationId: body.identificationId,
        identificationType: body.identificationType,
        email: body.email,
        address: body.address,
        imgLogo: body.imgLogo
    }, {
        new: true
    });
    return clientUpdated
        ? NextResponse.json(clientUpdated)
        : NextResponse.json(
              { error: "Client not found." },
              { status: 404 }
          );
}

export async function PUT(req, { params }) {
    try {
        const { id } = await params;
        if (typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id)) {
            return NextResponse.json(
                { error: "Invalid client id." },
                { status: 400 }
            );
        }

        const body = await req.json();
        if (typeof body.archived !== "boolean") {
            return NextResponse.json(
                { error: "The archived field must be a boolean." },
                { status: 400 }
            );
        }

        await connectMongoDB();
        const client = await Client.findByIdAndUpdate(
            id,
            { $set: { archived: body.archived } },
            { new: true, runValidators: true }
        );

        if (!client) {
            return NextResponse.json(
                { error: "Client not found." },
                { status: 404 }
            );
        }

        return NextResponse.json({
            id: client._id.toString(),
            archived: client.archived,
        });
    } catch (error) {
        console.error("Error updating client archive status:", error);
        return NextResponse.json(
            { error: "Could not update client archive status." },
            { status: 500 }
        );
    }
}