import mongoose, { Schema, models } from "mongoose";

const taskSchema = new Schema(
  {
    projectId: {
      type: mongoose.Types.ObjectId,
      ref: "Project",
    },
    type: {
      type: Number, // 1. NextJS dev, 2. Angular dev., 3. Gestión web-mail, 4. Meteor dev, 
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      required: true,
    },
    weight: {
      type: Number,
    },
    attachments: {
        type: [String],
    },    
  },
  { timestamps: true }
);

const Task = models.Task || mongoose.model("Task", taskSchema);
export default Task;