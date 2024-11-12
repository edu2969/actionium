import { connectMongoDB } from "@/lib/mongodb"
import PurchaseOrder from "@/models/purchase-order"
import StorageItem from "@/models/storage-item"
import ToolStorage from "@/models/tool-storage"
import { NextResponse } from "next/server"
import { PURCHASE_ORDER_STATUS, RESOURCE_TYPES } from "../../utils/constants"

export async function GET() {
    try {
        console.log("Getting Inventory panel stats...");
        await connectMongoDB();
        const pos = await PurchaseOrder.find({ status: { $lte: PURCHASE_ORDER_STATUS.aproved }});
        const ts = await ToolStorage.findOne();
        const storageItems = await StorageItem.find({
            resourceType: { $in: [RESOURCE_TYPES.equipo, RESOURCE_TYPES.herramienta]}
        });
        console.log("SIs", storageItems);
        var tools = storageItems.reduce((acc, si) => {
            acc.terrain += si.quantities.terrain || 0;
            acc.repairing += si.quantities.reparation || 0;            
            return acc;
        }, {
            terrain: 0,
            repairing: 0,
        });
        return NextResponse.json({ 
            pendingPOs: pos.length,
            tools,
            alerts: 0,
         });
    } catch (error) {
        console.log(error);
    }
}