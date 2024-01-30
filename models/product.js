import mongoose, { Schema, models } from "mongoose";

const sotckRangesSchema = new Schema({
  min: {
    type: Number,
    required: true,
  },
  max: {
    type: Number,
    required: true,
  }
})

const productSchema = new Schema(
  {
    identifier: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    stockRanges: {
      type: sotckRangesSchema,
      required: true,
    },
  },
  { timestamps: true }
);

const Product = models.Product || mongoose.model("Product", productSchema);
export default Product;