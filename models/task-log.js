import mongoose, { Schema, models } from "mongoose";

const taskLogSchema = new Schema(
  {
    taskId: {
      type: mongoose.Types.ObjectId,
      ref: "Task",
    },
    date: {
      type: Date,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    attachments: {
      type: [String],
    },    
  },
  { timestamps: true }
);

const TaskLog = models.TaskLog || mongoose.model("TaskLog", taskLogSchema);
export default TaskLog;