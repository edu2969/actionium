import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import ToolStorage from "@/models/tool-storage"
import StorageItem from "@/models/storage-item"
import StorageItemLog from "@/models/storage-item-log"
import UserStorageItemSet from "@/models/user-storage-item-set"
import { OPERATIONS } from "@/app/utils/constants";

export async function POST(req) {
    try {
        await connectMongoDB();
        const item = await req.json();
        console.log("SALE", item);
        const ts = await ToolStorage.findOne();
        const si = await StorageItem.findOne({ _id: item.storageItemId });
        var quantities = si.quantities;
        quantities.availables -= item.quantity;
        quantities.terrain += item.quantity;
        var respUpdate1 = await StorageItem.findByIdAndUpdate(item.storageItemId, {
            quantities
        });
        console.log("RESP", respUpdate1);        
        const setup = await UserStorageItemSet.findOne({
            userId: item.userId,
            storageItemId: item.storageItemId,
        })        
        if(!setup) {
            const respUSISet = await UserStorageItemSet.create({
                userId: item.userId,
                toolStorageId: ts._id.valueOf(),
                storageItemId: item.storageItemId,
                quantity: item.quantity,
            });
            if(respUSISet) {
                const nLog = await StorageItemLog.create({
                    userId: item.userId,
                    storageItemId: item.storageItemId,
                    quantity: item.quantity,
                    operation: OPERATIONS.out,
                    date: new Date(),
                    note: '',
                })
                if(nLog) {
                    return NextResponse.json({ ok: true });    
                }                
            }
            return NextResponse.json({}, { status: 500, statusText: respUSISet});
        } else {
            console.log("SETUP", setup);
            var quantity = setup.quantity + item.quantity;
            const respUpdate = await UserStorageItemSet.findByIdAndUpdate(setup._id, {
                quantity
            });
            if(respUpdate) {
                const nLog = await StorageItemLog.create({
                    userId: item.userId,
                    storageItemId: item.storageItemId,
                    quantity: item.quantity,
                    operation: OPERATIONS.out,
                    date: new Date(),
                    note: '',
                })
                if(nLog) {
                    return new NextResponse.json({ ok: true });    
                }
            }
            return NextResponse.json({}, { status: 500, statusText: respUpdate });
        }        
    } catch (error) {
        console.error("ERROR", error);
        return NextResponse.json({}, { status: 500, statusText: error.toString() });
    }
}