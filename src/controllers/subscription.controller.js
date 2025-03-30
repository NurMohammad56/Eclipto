import mongoose, { isValidObjectId } from "mongoose";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subcription } from "../models/subscription.models.js";
import { User } from "../models/user.models.js";

// ToggleSubscribe

export const toggleSubscribe = AsyncHandler(async (req, res) => {
    try {
        const { userId, channelId } = req.body;
        if (!isValidObjectId(userId) || !isValidObjectId(channelId)) {
            throw new ApiError(400, "Invalid user or channel id");
        }

        const user = await User.findById(userId);
        if (!user) {
            throw new ApiError(404, "User not found");
        }
        const channel = await User.findById(channelId);
        if (!channel) {
            throw new ApiError(404, "Channel not found");
        }
        const subscription = await Subcription.findOne({
            subscriber: userId,
            channel: channelId
        });
        if (subscription) {
            await subscription.remove();
        } else {
            //Actually a user is a subscriber and also a user is a channel

            await Subcription.create({ subscriber: userId, channel: channelId });
        }
        res.status(200).json(ApiResponse.success(true));
    } catch (error) {
        throw new ApiError(500, error.message);
    }
})