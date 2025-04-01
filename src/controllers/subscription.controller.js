import { isValidObjectId } from "mongoose";
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
        const subscription = await Subscription.findOne({
            subscriber: userId,
            channel: channelId
        });
        if (subscription) {
            await subscription.remove();
        } else {
            //Actually a user is a subscriber and also a user is a channel

            await Subscription.create({ subscriber: userId, channel: channelId });
        }
        res.status(200).json(ApiResponse.success(true));
    } catch (error) {
        throw new ApiError(500, error.message);
    }
})

// controller to return subscriber list of a channel
export const getUserChannelSubscribers = AsyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID");
    }

    const subscribers = await Subcription.find({ channel: channelId })
        .populate("subscriber", "userName fullName avatar")
        .lean();

    if (!subscribers.length) {
        return res.status(404).json(ApiResponse.error("No subscribers found for this channel."));
    }

    res.status(200).json(
        ApiResponse(
            200,
            subscribers,
            "Subscribed users fetched successfully"
        )
    )
});

// controller to return channel list to which user has subscribed
export const getSubscribedChannels = AsyncHandler(async (req, res) => {
    try {
        const { userId } = req.params
        if (!isValidObjectId(userId)) {
            throw new ApiError(400, "Invalid subscriber ID");
        }
        const subscribedChannels = await Subcription.find({ subscriber: userId })
            .populate("channel", "name description")
            .lean();
        if (!subscribedChannels.length) {
            return res.status(404).json(ApiResponse.error("No channels found for this subscriber."));
        }
        res.status(200).json(
            ApiResponse(
                200,
                subscribedChannels,
                "Subscribed channels fetched successfully"
            )
        )
    } catch (error) {
        throw new ApiError(500, error.message);
    }

})