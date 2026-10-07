import { connectMongoDB } from "@/lib/mongodb";
import Client from "@/models/client";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await connectMongoDB();
        const clients = await Client.find({}, { _id: 1, archived: 1, preferences: 1 }).lean();
        const preferencesByClientId = Object.fromEntries(
            clients.map((client) => [
                client._id.toString(),
                {
                    archived:
                        typeof client.preferences?.archived === "boolean"
                            ? client.preferences.archived
                            : client.archived === true,
                },
            ])
        );

        return NextResponse.json({ preferencesByClientId });
    } catch (error) {
        console.error("Error fetching client preferences:", error);
        return NextResponse.json(
            { error: "Could not fetch client preferences." },
            { status: 500 }
        );
    }
}
