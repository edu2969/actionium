import { connectMongoDB } from "@/lib/mongodb";
import Client from "@/models/client";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
    try {
        const { id } = await params;
        if (typeof id !== "string" || !/^[a-f\d]{24}$/i.test(id)) {
            return NextResponse.json(
                { error: "Invalid client id." },
                { status: 400 }
            );
        }

        const body = await request.json();
        if (!body || typeof body.archived !== "boolean") {
            return NextResponse.json(
                { error: "The archived preference must be a boolean." },
                { status: 400 }
            );
        }

        await connectMongoDB();
        const client = await Client.findByIdAndUpdate(
            id,
            { $set: { "preferences.archived": body.archived } },
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
            preferences: {
                archived: client.preferences?.archived ?? body.archived,
            },
        });
    } catch (error) {
        console.error("Error updating client preferences:", error);
        return NextResponse.json(
            { error: "Could not update client preferences." },
            { status: 500 }
        );
    }
}
