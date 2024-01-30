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

const biToolStorageSchema = new Schema(
  {
    toolStorageId: {
      type: mongoose.Types.ObjectId,
      ref: "ToolStorage",
    },
    totalAmount: {
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
    quantities: {
        type: quantitiesSchema,
        required: true,
    },    
  },
  { timestamps: true }
);

const BIToolStorage = models.BIToolStorage || mongoose.model("BIToolStorage", biToolStorageSchema);
export default BIToolStorage;