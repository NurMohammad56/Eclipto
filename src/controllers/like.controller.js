import mongoose, { isValidObjectId } from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { Comment } from "../models/comment.models.js";
import { Video } from "../models/video.models.js";
import { Like } from "../models/like.models.js";
// 1
// 2
// 3
// 4
// 5
// 6
// 7
// 8

// Toggle like on a video
export const toggleVideoLike = AsyncHandler(async (req, res) => {
    try {
        const { videoId } = req.params;
        const userId = req.user._id;

        if (!mongoose.isValidObjectId(videoId)) {
            throw new ApiError(400, "Invalid video ID");
        }

        // Check if the video exists
        const video = await Video.findById(videoId);
        if (!video) {
            throw new ApiError(404, "Video not found");
        }

        // Check if the user has already liked the video
        const existingLike = await Like.findOne({ video: videoId, likedBy: userId });

        if (existingLike) {
            // Unlike the video
            await Like.findByIdAndDelete(existingLike._id);
            video.likes = Math.max(0, video.likes - 1);
            await video.save();

            return res
                .status(200)
                .json(new ApiResponse(200, "Video unliked successfully", { likes: video.likes }));
        }

        // Like the video
        const newLike = new Like({
            video: videoId,
            likedBy: userId,
        });

        await newLike.save();
        video.likes += 1;
        await video.save();

        return res
            .status(200)
            .json(new ApiResponse(200, "Video liked successfully", { likes: video.likes }));
    } catch (error) {
        console.error("Error while toggling video like:", error);
        throw new ApiError(500, error.message || "Failed to toggle video like");
    }
});

export const toggleCommentLike = AsyncHandler(async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.user._id;

        if (!isValidObjectId(commentId)) {
            throw new ApiError(400, "Invalid comment ID");
        }
        const comment = await Comment.findById(commentId);
        if (!comment) {
            throw new ApiError(404, "Comment not found");
        }
        const existingLike = await Like.findOne({ comment: commentId, likedBy: userId });
        if (existingLike) {
            await Like.findByIdAndDelete(existingLike._id);
            comment.likes = Math.max(0, comment.likes - 1);
            await comment.save();
            return res.status(200).json(new ApiResponse(200, "Comment unliked successfully", { likes: comment.likes }));
        }
        const newLike = new Like({
            comment: commentId,
            likedBy: userId,
        });

        await newLike.save();
        comment.likes += 1;
        await comment.save();

        return res.status(200).json(new ApiResponse(200, "Comment liked successfully", { likes: comment.likes }));
    } catch (error) {
        console.error("Error while toggling comment like:", error);
        throw new ApiError(500, error.message || "Failed to toggle comment like");
    }

})