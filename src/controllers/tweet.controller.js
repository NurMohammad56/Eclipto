import { isValidObjectId } from "mongoose";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.models.js";
import { User } from "../models/user.models.js";

export const createTweet = AsyncHandler(async (req, res) => {
try {
        const { text } = req.body;
        const userId = req.user;
        if (!text) {
            throw new ApiError(400, "Text is required");
        }
        const user = await User.findById(userId);
        if (!isValidObjectId(user)) {
            throw new ApiError(404, "User not found");
        }
        const tweet = await Tweet.create({ text, user: userId });
        res.status(201).json(
            new ApiResponse(201, tweet, "Tweet created successfully")
        );
} catch (error) {
    console.error("Error while creating tweet:", error);
    throw new ApiError(500, error.message || "Failed to create tweet");  
}
})

export const getUserTweets = AsyncHandler(async (req, res) => {
    // TODO: get user tweets
})

export const updateTweet = AsyncHandler(async (req, res) => {
    //TODO: update tweet
})

export const deleteTweet = AsyncHandler(async (req, res) => {
    //TODO: delete tweet
})