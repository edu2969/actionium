import mongoose, { Schema, models } from "mongoose";

const biVendorSchema = new Schema(
  {
    vendorId: {
      type: mongoose.Types.ObjectId,
      ref: "Vendor",
    },
    productId: {
      type: mongoose.Types.ObjectId,
      ref: "Product",
    },
    quantity: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    period: {
      type: String,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const BIVendor = models.BIVendor || mongoose.model("BIVendor", biVendorSchema);
export default BIVendor;