import { connectMongoDB } from "@/lib/mongodb";
import { NextResponse } from "next/server";
import UserStorageItemSet from "@/models/user-storage-item-set";
import ToolStorage from "@/models/tool-storage"
import StorageItem from "@/models/storage-item"
import Product from "@/models/product"

export async function GET(req, { params }) {
    await connectMongoDB();
    const ts = await ToolStorage.findOne({});    
    const set = await UserStorageItemSet.find({ toolStorageId: ts._id, userId: params.id, quantity: { $gt: 0 }});
    var itemSet = [];
    for(var i = 0; i < set.length; i++) {
        const si = await StorageItem.findOne({ _id: set[i].storageItemId });
        const p = await Product.findOne({ _id: si.productId });
        itemSet.push({
            userStorageItemId: set[i]._id,
            storageItemId: si._id,
            identifier: p.identifier,
            name: p.name,
            quantity: set[i].quantity,
        })
    }    
    return NextResponse.json({ set: itemSet });
}


