import { NextResponse } from "next/server";
import { connectMongoDB } from "@/lib/mongodb";
import { STORAGE_ITEM_STATE } from "@/app/utils/constants"
import ToolStorage from "@/models/tool-storage"
import StorageItem from "@/models/storage-item"
import StorageItemLog from "@/models/storage-item-log"
import UserStorageItemSet from "@/models/user-storage-item-set"

export async function POST(req) {
    console.log("POST......");
    try {
        await connectMongoDB();
        const item = await req.json();
        console.log("ENTRA", item);
        const ts = await ToolStorage.findOne();        
        const usset = await UserStorageItemSet.findOne({ 
            userId: item.userId, 
            storageItemId: item.storageItemId 
        });
        var quantity = usset.quantity - 1;
        const respUpdate1 = await UserStorageItemSet.findByIdAndUpdate(usset._id, {
            quantity
        })
        const si = await StorageItem.findOne({
            _id: item.storageItemId           
        });
        var quantities = si.quantities;
        if(item.state == STORAGE_ITEM_STATE.operative) {
            quantities.available += item.quantity;
            quantities.terrain -= item.quantity;
        }
        if(item.state == STORAGE_ITEM_STATE.reparation) {
            quantities.reparation += item.quantity;
            quantities.terrain -= item.quantity;
        }
        if(item.state == STORAGE_ITEM_STATE.discard) {
            quantities.disposable += item.quantity;
            quantities.available -= item.quantity;
            quantities.terrain -= item.quantity;
        }
        var respUpdate2 = await StorageItem.findByIdAndUpdate(item.storateItemId, {
            quantities
        });        
        if(respUpdate1 && respUpdate2) {
            const setup = await UserStorageItemSet.findOne({
                userId: item.userId,
                storateItemId: item.storateItemId,
            })            
            var quantity = setup.quantity - item.quantity;
            if(quantity < 0) {
                return NextResponse({ error: true, resp: `There is no ${item.quantity}x ${item.storateItemId} (max.${setup.quantity})`});
            }                
            const respUpdate = await UserStorageItemSet.findByIdAndUpdate(setup._id, {
                quantity
            });
            const operation = item.state == STORAGE_ITEM_STATE.operative ? 'in' 
                : item.state == STORAGE_ITEM_STATE.reparation ? 'r_in' 
                : 'down';
            const nlog = await StorageItemLog.create({
                userId: item.userId,
                storageItemId: item.storageItemId,
                quantity: item.quantity,
                operation: 'out',
                date: new Date(),
                note: '',
            })
            if(respUpdate) {
                return NextResponse.json({ ok: true });    
            }
            return NextResponse.json({ error: true, resp: respUpdate });        
        }           
        return NextResponse.json({ error: true, resp: respUpdate1 });
    } catch (error) {
        console.error("ERROR", error);
        return NextResponse.json({ message: "Error", error });
    }
}