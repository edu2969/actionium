import mongoose, { Schema, models } from "mongoose";

const priceLogSchema = new Schema(
  {
    productId: {
      type: mongoose.Types.ObjectId,
      required: true,
    },
    date: {
        type: Date,
        required: true,
    },
    value: {
      type: String,
      required: true,
    },   
    currency: {
        type: String,
        required: true,
    } 
  },
  { timestamps: true }
);

const PriceLog = models.PriceLog || mongoose.model("PriceLog", priceLogSchema);
export default PriceLog;