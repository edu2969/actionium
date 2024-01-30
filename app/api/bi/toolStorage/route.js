import { connectMongoDB } from "@/lib/mongodb"
import { NextResponse } from "next/server"
import ToolStorage from "@/models/tool-storage"
import BIToolStorage from "@/models/bi-tool-storage"

export async function GET() {
    try {
        console.log("BI-ToolStorage data...");
        await connectMongoDB();
        const ts = await ToolStorage.findOne();
        const bis = await BIToolStorage.find({ toolStorageId: ts._id })
        return NextResponse.json({ 
            data: bis
        });
    } catch (error) {
        return NextResponse.json({}, { status: 500, statusText: error.toString() })
    }
}