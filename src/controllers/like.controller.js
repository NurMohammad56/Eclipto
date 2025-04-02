import mongoose, { isValidObjectId } from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { Video } from "../models/video.models.js";
import { Like } from "../models/like.models.js";

// Toggle like on a video
export const toggleVideoLike = AsyncHandler(async (req, res) => {
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
  });