import mongoose, { Schema, models } from "mongoose";

const purchaseOrderitemSchema = new Schema(
  {
    purchaseOrderId: {
      type: mongoose.Types.ObjectId,
      ref: "PurchaseOrder",
    },
    identifier: {
      type: String,
      required: true,
    },
    lineNumber: {
      type: Number,
      required: true,
    },
    productId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    unitPrice: {
      type: Number,
      required: true,
    },
    netAmount: {
        type: Number,
        required: true,
    },
  },
  { timestamps: true }
);

const PurchaseOrderItem = models.PurchaseOrderItem || mongoose.model("PurchaseOrderItem", purchaseOrderitemSchema);
export default PurchaseOrderItem;