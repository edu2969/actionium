import { connectMongoDB } from "@/lib/mongodb";
import StorageItem from "@/models/storage-item";
import ToolStorage from "@/models/tool-storage"
import Products from "@/models/product"
import { NextResponse } from "next/server";
import UserStorageItemSet from "@/models/user-storage-item-set";
import User from "@/models/user";
import StorageItemLog from "@/models/storage-item-log";
import { OPERATIONS } from "@/app/utils/constants";

export async function GET() {
    console.log("getStorageItems...");
    await connectMongoDB();
    const ts = await ToolStorage.findOne();
    const items = await StorageItem.find({ toolStorageId: ts._id });
    const productsId = items.map(i => i.productId);
    const products = await Products.find({ _id: { $in: productsId } });

    var list = JSON.parse(JSON.stringify(items)).map(i => {
        i.product = products.find(p => p._id == i.productId);            
        return i;
    });
    for(var i = 0; i < list.length; i++) {
        var sets = await UserStorageItemSet.find({
            toolStorageId: ts._id,
            storageItemId: list[i]._id,
            quantity: { $gt: 0 }
        });
        list[i].borrowedTo = [];
        for(var j = 0; j < sets.length; j++) {
            var user = await User.findOne({ _id: sets[j].userId });
            var log = await StorageItemLog.findOne({
                userId: sets[j].userId,
                storageItemId: list[i]._id,
                operation: OPERATIONS.out,
            });
            console.log("LOG", {
                userId: user._id.valueOf(),
                storageItemId: list[i]._id,
                operation: OPERATIONS.out,
            }, log)
            list[i].borrowedTo.push({                
                avatarImg: user.avatarImg,
                name: user.name,
                quantity: sets[j].quantity,
                date: log.date,
            });
        }        
    }    
    return NextResponse.json({ items: list });
}
