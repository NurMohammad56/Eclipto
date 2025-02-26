import mongoose, { isValidObjectId } from "mongoose";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { Video } from "../models/video.models.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";

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

  if (!req.files || !req.files.videoFile || !req.files.thumbnail) {
    res.status(400);
    throw new ApiError(400, "Both video and thumbnail file is required");
  }

  const videoLocalPath = req.files.videoFile[0].path;
  const thumbnailLocalPath = req.files.thumbnail[0].path;

  try {
    const uploadVideo = await uploadOnCloudinary(
      videoLocalPath,
      "video",
      "videos"
    );
    const uploadThumbnail = await uploadOnCloudinary(
      thumbnailLocalPath,
      "image",
      "thumbnail"
    );

    const videoData = {
      title,
      description,
      videoUrl: uploadVideo.secure_url,
      thumbnailUrl: uploadThumbnail.secure_url,
      duration: uploadOnCloudinary.duration,
    };

    const video = await Video.create(videoData);
    if (!video) {
      res.status(500);
      throw new ApiError(500, "Failed to create video");
    }

    res
      .status(200)
      .json(new ApiResponse(200, video, "Video created successfully"));
  } catch (error) {
    throw new ApiError(500, "Failed to publish video");
  }
});

export { getAllVideos, publishAVideo };
