import mongoose, { Schema, models } from "mongoose";

const purchaseOrderSchema = new Schema(
  {
    identifier: {
      type: String,
      required: true,
    },
    site: {
      type: String,
      required: true,
    },
    invoiceAccount: {
      type: String,
      required: true,
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: "Vendor",
    },
    approvalStatus: {
      type: Number,
      required: true,
    },
    status: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    requesterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    requestReceiptDate: {
      type: Date,
      required: true,
    },
    projectId: {
      type: String,
      required: true,
    },
    termsOfPayment: {
      type: String,
      required: true,
    },
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    createdAt: {
      type: Date,
      required: true,
    }
  },
  { timestamps: true }
);

const PurchaseOrder = models.PurchaseOrder || mongoose.model("PurchaseOrder", purchaseOrderSchema);
export default PurchaseOrder;