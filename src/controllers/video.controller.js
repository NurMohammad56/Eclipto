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

export { getAllVideos, publishAVideo };
