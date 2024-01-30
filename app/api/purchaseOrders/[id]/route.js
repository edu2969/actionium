import { connectMongoDB } from "@/lib/mongodb";
import PurchaseOrder from "@/models/PurchaseOrder";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
    console.log("PurchaseOrder getById...", params);
    await connectMongoDB();
    const pos = await PurchaseOrder.find({ _id: params.id });
    return NextResponse.json(purchaseOrders.length ? { pos: pos[0] } : ("Purchase Orders " + params + " not found", {
        status: 400,
    }));
}


export async function POST(req, { params }) {
    const body = await req.json();
    console.log("Update...", body, params);
    return;
    const purchaseOrderUpdated = await PurchaseOrder.findByIdAndUpdate(params.id, {
        name: body.name,
        email: body.email,
        role: body.role,
        rut: body.rut,
        gender: body.gender,
        birthDate: body.birthDate ? new Date(body.birthDate) : null,
        avatarImg: body.avatarImg
    }, {
        new: true
    });
    return purchaseOrderUpdated ? NextResponse.json(purchaseOrderUpdated) : NextResponse.json(error.message, {
        status: 404,
    })
}

