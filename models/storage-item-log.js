import mongoose, { Schema, models } from "mongoose";

const storageItemLogSchema = new Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    storageItemId: {
      type: mongoose.Types.ObjectId,
      ref: "StorageItem",
    },
    quantity: {
      type: Number,
      required: true,
    },
    operation: {
      type: Number,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    note: {
      type: String
    }
  },
  { timestamps: true }
);

const StorageItemLog = models.StorageItemLog || mongoose.model("StorageItemLog", storageItemLogSchema);
export default StorageItemLog;