import mongoose, { Schema, models } from "mongoose";

const clientSchema = new Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    brandId: {
      type: mongoose.Types.ObjectId,
      ref: "Brand",
    },
    rut: {
      type: String,
    },
    address: {
      type: String, 
    },
    country: {
      type: String,
    },
    birthDate: {
      type: Date,
    },
    resume: {
      type: String,      
    },
  },
  { timestamps: true }
);

const Client = models.Client || mongoose.model("Client", clientSchema);
export default Client;