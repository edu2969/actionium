import mongoose, { Schema, models } from "mongoose";

const userStorageItemSetSchema = new Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    toolStorageId: {
      type: mongoose.Types.ObjectId,
      ref: "ToolStorage",
    },
    storageItemId: {
      type: mongoose.Types.ObjectId,
      ref: "StorageItem",
    },
    quantity: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const UserStorageItemSet = models.UserStorageItemSet || mongoose.model("UserStorageItemSet", userStorageItemSetSchema);
export default UserStorageItemSet;