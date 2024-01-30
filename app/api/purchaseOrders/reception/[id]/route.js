import { NextResponse } from "next/server"
import { connectMongoDB } from "@/lib/mongodb"
import PurchaseOrder from "@/models/purchase-order"
import ToolStorage from "@/models/tool-storage"
import PurchaseOrderItem from "@/models/purchase-order-item"
import StorageItem from "@/models/storage-item"
import Vendor from "@/models/vendor"
import BIStorageItem from "@/models/bi-storage-item"
import BIVendor from "@/models/bi-vendor"
import BIToolStorage from "@/models/bi-tool-storage"
import PriceLog from "@/models/price-log"
import dayjs from "dayjs"

export async function POST(req, { params }) {
    await connectMongoDB();
    console.log("reception", params);
    // Flujo de recepcion. Se crean los items en bodega si no existen o se actualizan.
    // se crean o actualizan BI de inventario y proveedores
    const ts = await ToolStorage.findOne();
    const purchaseOrder = await PurchaseOrder.findById(params.id);
    const vendor = await Vendor.findById(purchaseOrder.vendorId);
    const items = await PurchaseOrderItem.find({ purchaseOrderId: purchaseOrder._id });
    var totalAmount = 0;
    var totalTools = 0;
    for(var i = 0; i < items.length; i++) {
        const item = items[i];
        var storageItem = await StorageItem.findOne({ identifier: item.identifier });
        if(!storageItem) {
            storageItem = await StorageItem.create({
                toolStorageId: ts._id,
                identifier: item.identifier,
                productId: item.productId,
                quantities: {
                    available: item.quantity,
                    reparation: 0,
                    terrain: 0,
                    discard: 0,
                    total: item.quantity,
                },
                stockRanges: {
                    min: item.quantity,
                    max: item.quantity,
                }
            })
        } else {
            storageItem = await StorageItem.findByIdAndUpdate(storageItem._id, {
                quantities: {
                    operative: storageItem.quantities.operative + item.quantity,
                    reparation: storageItem.quantities.reparation,
                    terrain: storageItem.quantities.terrain,
                    total: storageItem.quantities.total + item.quantity,
                }
            })            
        }
        totalTools += item.quantity;
        var biStorageItem = await BIStorageItem.find({
            toolStorageId: ts._id,
            storageItemId: storageItem._id
        });
        if(!biStorageItem) {
            biStorageItem = await BIStorageItem.create({
                toolStorageId: ts._id,
                storageItemId: storageItem._id,
                date: new Date(),
                period: "month",
                quantities: storageItem.quantities,
            });
        }
        var priceLog = await PriceLog.findOne({
            productId: item.productId
        }).sort({
            date: 1,
        });
        var biVendor = await BIVendor.findOne({
            vendorId: vendor._id,
            productId: item.productId,
            period: "month",
        })
        if(!biVendor) {
            biVendor = await BIVendor.create({
                vendorId: vendor._id,
                productId: item.productId,
                quantity: item.quantity,
                price: priceLog.value,
                date: new Date(),
                period: "month",
                totalAmount: item.netAmount,
            });
            totalAmount += item.netAmount;
        } else {
            biVendor = await BIVendor.findByIdAndUpdate(biVendor, {
                quantity: biVendor.quantity + item.quantity,
                totalAmount: biVendor.totalAmount + item.netAmount
            });
            totalAmount += biVendor.totalAmount + item.netAmount;
        }   
    }    

    var biTS = await BIToolStorage.findOne({ toolStorageId: ts._id })
    if(!biTS) {
        biTS = await BIToolStorage.create({
            toolStorageId: ts._id,
            totalAmount,
            date: dayjs().startOf("month").toDate(),
            period: 'month',
            quantities: {
                operative: totalTools,
                reparation: 0,
                terrain: 0,
                total: totalTools,
            }
        })
    } else {
        var quantities = biTS.quamtities;
        quantities.operative += totalTools;
        quantities.total += totalTools;        
        biTS = await BIToolStorage.findByIdAndUpdate(biTS._id, {
            quantities,
            totalAmount: biTS.totalAmount + totalAmount,
        });
    } 
    
    const purchaseOrderUpdated = await PurchaseOrder.findByIdAndUpdate(params.id, {
        status: 3
    });
    return purchaseOrderUpdated ? NextResponse.json(purchaseOrderUpdated) : NextResponse.json(error.message, {
        status: 404,
    })
}