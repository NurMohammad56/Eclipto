import mongoose, { isValidObjectId } from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import fs from "fs";

// Get all videos
const getAllVideos = AsyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    query,
    sortBy = "createdAt",
    sortType = "desc",
    userId,
  } = req.query;

  console.log(req.user);

  let filter = {};

  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ];
  }

  if (userId && isValidObjectId(userId)) {
    filter.owner = userId;
  }

  let sortOption = {};
  sortOption[sortBy] = sortType === "asc" ? 1 : -1;

  const videos = await Video.find(filter)
    .sort(sortOption)
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const totalVideos = await Video.countDocuments(filter);

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { videos, totalVideos, page: parseInt(page), limit: parseInt(limit) },
        "Videos fetched successfully"
      )
    );
});

// publish the video
const publishAVideo = AsyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const userId = req.user;

  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  console.log(req.files);
  if (!req.files || !req.files.videoFile || !req.files.thumbnail) {
    throw new ApiError(400, "Both video and thumbnail files are required");
  }

  const videoFile = req.files.videoFile[0];
  const thumbnailFile = req.files.thumbnail[0];

  if (!videoFile?.path || !thumbnailFile?.path) {
    throw new ApiError(400, "Invalid file paths for video or thumbnail");
  }

  try {
    const uploadVideo = await uploadOnCloudinary(
      videoFile.path,
      "video",
      "videos"
    );
    const uploadThumbnail = await uploadOnCloudinary(
      thumbnailFile.path,
      "image",
      "thumbnails"
    );

    if (!uploadVideo?.secure_url || !uploadThumbnail?.secure_url) {
      throw new ApiError(500, "Cloudinary upload failed");
    }

    try {
      if (fs.existsSync(videoFile.path)) fs.unlinkSync(videoFile.path);
      if (fs.existsSync(thumbnailFile.path)) fs.unlinkSync(thumbnailFile.path);
      console.log("Local files deleted successfully!");
    } catch (cleanupError) {
      console.error("Failed to delete local files:", cleanupError);
    }

    const videoData = {
      title,
      owner: user.userName,
      description,
      videoFile: uploadVideo.secure_url,
      thumbnail: uploadThumbnail.secure_url,
      duration: uploadVideo.duration || 0,
    };

    const video = await Video.create(videoData);
    if (!video) {
      throw new ApiError(500, "Failed to create video in database");
    }

    res
      .status(200)
      .json(new ApiResponse(200, video, "Video created successfully"));
  } catch (error) {
    console.error("Error while publishing video:", error);
    throw new ApiError(500, error.message || "Failed to publish video");
  }
});

// Get video by id
const getVideoById = AsyncHandler(async (req, res) => {
  const { videoId } = req.params;

  const singleVideo = await Video.findById(videoId);

  if (!singleVideo) {
    throw new ApiError(404, "Video not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, singleVideo, "Video fetched successfully"));
});

// Update video by id
const updateVideoById = AsyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  let updateData = { title, description };

  if (req.files && req.files.thumbnail) {
    const thumbnailLocalPath = req.files.thumbnail[0].path;

    try {
      const uploadThumbnail = await uploadOnCloudinary(
        thumbnailLocalPath,
        "image",
        "thumbnail"
      );
      updateData.thumbnail = uploadThumbnail.secure_url;
    } catch (error) {
      throw new ApiError(500, "Failed to upload thumbnail");
    }
  }

  const updatedVideo = await Video.findByIdAndUpdate(videoId, updateData, {
    new: true,
    runValidators: true,
  });

  if (!updatedVideo) {
    throw new ApiError(404, "Video not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, updatedVideo, "Video updated successfully"));
});

// Delete video by id
const deleteVideo = AsyncHandler(async (req, res) => {
  const { videoId } = req.params;
  if (!isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video ID");
  }

  const deletedVideo = await Video.findByIdAndDelete(videoId);
  if (!deletedVideo) {
    throw new ApiError(404, "Video not found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, deletedVideo, "Video deleted successfully"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideoById,
  deleteVideo,
};
