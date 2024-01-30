import mongoose, { Schema, models } from "mongoose";

const paymentSchema = new Schema({
  type: {
    type: String,
    required: true,
  },
  status: {
    type: Number,
    required: true,
  },
  confirmed: {
    type: Date,
  },
  paid: {
    type: Date,
  },
  netAmount: {
    type: Number,
    required: true,
  },
})

const projectSchema = new Schema({
  brandId: {
    type: mongoose.Types.ObjectId,
    ref: "Brand",
  },
  clientId: {
    type: mongoose.Types.ObjectId,
    ref: "Client",
  },
  payments: {
    type: [paymentSchema],
  },
  netAmount: {
    type: Number,
  },
  totalOutcomes: {
    type: Number,
  },
  costRatio: {
    type: Number,
  }
},
  { timestamps: true });

const Project = models.Project || mongoose.model("Project", projectSchema);
export default Project;