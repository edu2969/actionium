import mongoose, { Schema, models } from "mongoose";

const brandSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    fantasyName: {
      type: String,
      required: true,
    },
    activity: {
      type: String,
    },
    avatarImg: {
      type: String,
    },
    address: {
      type: sotckRangesSchema,
      required: true,
    },
    totalIncomes: {
      type: Number,
    },
    totalOutcomes: {
      type: Number,
    }
  },
  { timestamps: true }
);

const Brand = models.Brand || mongoose.model("Brand", brandSchema);
export default Brand;