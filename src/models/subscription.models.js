import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
  {
    subscriber: {
      type: Schema.Types.ObjectId, // Subscribing
      ref: "User",
    },
    channel: {
      type: Schema.Types.ObjectId, // Subscriber
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Subcription = mongoose.model("Subscription", subscriptionSchema);
