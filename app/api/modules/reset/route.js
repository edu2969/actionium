import { connectMongoDB } from "@/lib/mongodb"
import PurchaseOrder from "@/models/purchase-order"
import PurchaseOrderItem from "@/models/purchase-order-item"
import StorageItem from "@/models/storage-item"
import StorageItemLog from "@/models/storage-item-log"
import UserStorageItemSet from "@/models/user-storage-item-set"
import BIVendor from "@/models/bi-vendor"
import BIStorageItem from "@/models/bi-storage-item"
import BIToolStorage from "@/models/bi-tool-storage"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        console.log("Reset all collections...");
        await connectMongoDB();

        try {
            await StorageItem.collection.drop();
        } catch (e) {
            if (e.code === 26) {
                console.log('namespace %s not found', StorageItem.collection.name)
            } else {
                throw e;
            }
        }

        try {
            await UserStorageItemSet.collection.drop();
        } catch (e) {
            if (e.code === 26) {
                console.log('namespace %s not found', UserStorageItemSet.collection.name)
            } else {
                throw e;
            }
        }

        try {
            await StorageItemLog.collection.drop();
        } catch (e) {
            if (e.code === 26) {
                console.log('namespace %s not found', StorageItemLog.collection.name)
            } else {
                throw e;
            }
        }

        try {
            await PurchaseOrder.collection.drop();
        } catch (e) {
            if (e.code === 26) {
                console.log('namespace %s not found', PurchaseOrder.collection.name)
            } else {
                throw e;
            }
        }

        try {
            await PurchaseOrderItem.collection.drop();
        } catch (e) {
            if (e.code === 26) {
                console.log('namespace %s not found', PurchaseOrderItem.collection.name)
            } else {
                throw e;
            }
        }

        try {
            await BIVendor.collection.drop();
        } catch (e) {
            if (e.code === 26) {
                console.log('namespace %s not found', BIVendor.collection.name)
            } else {
                throw e;
            }
        }

        try {
            await BIStorageItem.collection.drop();
        } catch (e) {
            if (e.code === 26) {
                console.log('namespace %s not found', BIStorageItem.collection.name)
            } else {
                throw e;
            }
        }

        try {
            await BIToolStorage.collection.drop();
        } catch (e) {
            if (e.code === 26) {
                console.log('namespace %s not found', BIToolStorage.collection.name)
            } else {
                throw e;
            }
        }

        return NextResponse.json({ ok: true });
    } catch (error) {
        console.log(error);
        return NextResponse.json({}, { status: 500, statusText: error.toString() });
    }
}