import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    channel: {
      type: Schema.Types.ObjectId,
      ref: "Channel",
    },
  },
  {
    timestamps: true,
  }
);

export const Subcription = mongoose.model("Subscription", subscriptionSchema);
