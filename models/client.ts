import mongoose, { Schema, models } from "mongoose";

const PreferenceSchema = new Schema({
  archived: {
    type: Boolean,
    default: false
  },  
});

const clientSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    completeName: {
        type: String,
    },
    identificationId: {
      type: String,
    },
    identificationType: {
      type: String,
    },
    email: {
      type: String,
    },
    address: {
      type: String,
    },
    imgLogo: {
      type: String,
    },
    archived: {
      type: Boolean,
      default: false,
    },
    preferences: {
      type: PreferenceSchema,
      default: () => ({ archived: false }),
    }
  },
  { timestamps: true }
);

const Client = models.Client || mongoose.model("Client", clientSchema);
export default Client;