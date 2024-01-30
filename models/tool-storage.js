import mongoose, { Schema, models } from "mongoose";

const toolStorageSchema = new Schema(
  {
    managerId: {
      type: String,
      required: true,
    },
    startAt: {
        type: Date,
        required: true,
    },
    endAt: {
      type: Date,
    },    
  },
  { timestamps: true }
);

const ToolStorage = models.ToolStorage || mongoose.model("ToolStorage", toolStorageSchema);
export default ToolStorage;