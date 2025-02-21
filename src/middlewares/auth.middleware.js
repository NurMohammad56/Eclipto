import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "./../models/user.models.js";
import jwt from "jsonwebtoken";

export const verifyJWT = AsyncHandler(async (req, _, next) => {
  try {
    // get token from cookie or header
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer", "");

    // check if token is not available
    if (!token) {
      throw new ApiError(401, "Unauthorized access");
    }

    // verify token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // check if user is available and also remove password and refreshToken field from response
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    // check if user is not available then throw error
    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    // set user in req
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, error.message || "Unauthorized access");
  }
});
