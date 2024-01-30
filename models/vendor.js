import mongoose, { Schema, models } from "mongoose";

const vendorSchema = new Schema(
  {
    userId: {
      type: String,
    },
    name: {
        type: String,
        required: true,
    },
    rut: {
      type: String,
    },    
  },
  { timestamps: true }
);

const Vendor = models.Vendor || mongoose.model("Vendor", vendorSchema);
export default Vendor;