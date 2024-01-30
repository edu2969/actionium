import mongoose, { Schema, models } from "mongoose";

const quantitiesSchema = new Schema({
  operative: {
      type: Number,
      required: true,
  },
  reparation: {
      type: Number,
      required: true,
  },
  terrain: {
      type: Number,
      required: true,
  },
  total: {
      type: Number,
      required: true,
  }
})

const biStorageItemSchema = new Schema(
  {
    toolStorageId: {
      type: mongoose.Types.ObjectId,
      ref: "ToolStorage",
    },
    storageItemId: {
      type: mongoose.Types.ObjectId,
      ref: "StorageItem"
    },
    date: {
      type: Date,
      required: true,
    },
    period: {
      type: String,
      required: true,
    },
    quantities: {
        type: quantitiesSchema,
        required: true,
    },    
  },
  { timestamps: true }
);

const BIStorageItem = models.BIStorageItem || mongoose.model("BIStorageItem", biStorageItemSchema);
export default BIStorageItem;