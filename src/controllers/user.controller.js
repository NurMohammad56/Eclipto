import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "./../models/user.models.js";
import jwt from "jsonwebtoken";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { deleteFromCloudinary } from "../utils/CloudinariDestroy.js";

import mongoose from "mongoose";

// Generate access and refresh token
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    /*
    <<<<<<<<<<<<<<<<<<<This part is for personal things to implement>>>>>>>>>>>>>>>>>>>>>>>>>
    1.find the user using userId as a parameter the data comes as a argument
    2.generate accessToken and refreshToken using generateAccessToken() method
    3.store refreshToken in user.refreshToken
    4.save the user
    5.return accessToken and refreshToken
    */
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Some error occurred while generating access and refresh tokens"
    );
  }
};

// Register user
const registerUser = AsyncHandler(async (req, res) => {
  /*
  <<<<<<<<<<<<<<<<<<<This part is for personal things to implement>>>>>>>>>>>>>>>>>>>>>>>>>
  1.get user details from frontend or postman
  2.validation - not empty
  3.check if user already exists : email, userName
  4.check for images and avatar
  5.upload them to cloudinary, then again check the avatar still exist or not
  6.create user object - create entry in db
  7.remove password and refresh token field from response
  8.check for user created successfully or not
  9.return success or error message 
  */

  // get user details
  const { userName, email, fullName, password } = req.body;
  if (!req.body || Object.keys(req.body).length === 0) {
    throw new ApiError(400, "You are nothing fill-up anything");
  }

  // validation
  if (
    [userName, email, fullName, password].some(
      (field) => field?.trim("") === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // check email format
  if (!email || !email.includes("@") || !email.includes(".")) {
    throw new ApiError(400, "Invalid email format");
  }

  // check if user already exists
  const existedUser = await User.findOne({
    $or: [{ email }, { userName }],
  });

  if (existedUser) {
    throw new ApiError(409, "User already exists");
  }

  // check for images and avatar
  const avatarLocalPath = req.files?.avatar[0]?.path; //Required
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar is required");
  }

  // upload them to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  // then again check avatar still exist or not
  if (!avatar) {
    throw new ApiError(500, "Failed to upload images");
  }

  // create user object
  const user = await User.create({
    userName: userName.toLowerCase(),
    email,
    fullName,
    password,
    avatar: avatar.url,
    // coverImage: coverImage.url,
    coverImage: coverImage?.url || "",
  });

  // remove password and refreshToken
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // check for user created or not
  if (!createdUser) {
    throw new ApiError(500, "Failed to create user while registering user");
  }

  // return response
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered successfully"));
});

// Login user
const loginUser = AsyncHandler(async (req, res) => {
  /*
  <<<<<<<<<<<<<<<<<<<This part is for personal things to implement>>>>>>>>>>>>>>>>>>>>>>>>>
  1.get user details from frontend or postman
  2.using userName or email and password
  3.check if user exist or not
  4.compare password
  5.access token and refresh token generation
  6.store in cookie
  */

  // get user details
  const { userName, email, password } = req.body;

  // check email or userName is provided or not
  if (!email && !userName) {
    throw new ApiError(400, "Email or username is required");
  }

  // check if user exist or not with email or userName
  const user = await User.findOne({
    $or: [{ email }, { userName }],
  });

  // if user not found then throw error
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // compare the password
  const isPasswordCorrect = await user.isPasswordValid(password);
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid password");
  }

  // implement access and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  // again remove password and refreshToken filed from response
  const loggedUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // store in cookie
  const options = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(201)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          loggedUser,
          accessToken,
          refreshToken,
        },
        "User logged in successfully"
      )
    );
});
// Logout user
const logOutUser = AsyncHandler(async (req, res) => {
  /*
  <<<<<<<<<<<<<<<<<<<This part is for personal things to implement>>>>>>>>>>>>>>>>>>>>>>>>>
  1. find the user using req.user._id because we have already set user in req.user then $unset refreshToken: 1
  2. options for cookie
  3. return res and clear cookie accessToken and refreshToken
  */
  await User.findByIdAndUpdate(
    req.user._id,
    { $unset: { refreshToken: 1 } },
    { new: true }
  );

  const option = {
    httpOnly: true,
    secure: true,
  };

  res
    .status(201)
    .clearCookie("accessToken", option)
    .clearCookie("refreshToken", option)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

// generate new accessToken using refreshToken
const refreshAccessToken = AsyncHandler(async (req, res) => {
  /*
  <<<<<<<<<<<<<<<<<<<This part is for personal things to implement>>>>>>>>>>>>>>>>>>>>>>>>>
  1. get refreshToken from cookie
  2.check the incoming refreshToken is available
  3.verify the refreshToken using jwt.verify 
  4.check id user is available
  5.matching refreshToken with user refreshToken
  6.generate new accessToken and new refreshToken
  7.check accessToken is available or not
  8.cookie options
  9.return

  */
  // get refreshToken from cookie
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  // check if refreshToken is available
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized access");
  }

  try {
    // verify refreshToken
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    // check if user is available
    const user = await User.findById(decodedToken?._id);

    // check if user is not available then throw error
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    // Matching refreshToken with user refreshToken
    if (user.refreshToken !== incomingRefreshToken) {
      throw new ApiError(401, "Refrsh token is expired or used");
    }

    // generate new access token
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    // check access token is available or not
    if (!accessToken) {
      throw new ApiError(500, "Failed to generate access token");
    }

    // Cookie options
    const option = {
      httpOnly: true,
      secure: true,
    };

    // res
    res
      .status(200)
      .cookie("accessToken", accessToken, option)
      .cookie("refreshToken", newRefreshToken, option)
      .json(
        new ApiResponse(201, accessToken, "Access token refreshed successfully")
      );
  } catch (error) {
    throw new ApiError(401, "Invalid refresh token", error?.message);
  }
});

// Change password
const changePassword = AsyncHandler(async (req, res) => {
  /*
  <<<<<<<<<<<<<<<<<<<This part is for personal things to implement>>>>>>>>>>>>>>>>>>>>>>>>>
  1.get password with new password using req.body
  2.find the user
  3.check if user is available or not
  4.compare the password with old password
  5.if password not match then throw error
  6.save the new password
  7.return
  */

  // get oldPassword and newPassword from req.body
  const { oldPassword, newPassword } = req.body;

  // find the user
  const user = await User.findById(req.user._id);

  // check if user is available or not
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // compare the password with old password
  const isPasswordCorrect = await user.isPasswordValid(oldPassword);

  // if password not match then throw error
  if (!isPasswordCorrect) {
    throw new ApiError(401, "Please provide correct old password");
  }

  // save the new password
  user.password = newPassword;
  const savePassword = await user.save({ validateBeforeSave: true });

  // check if password is changed or not
  if (!savePassword) {
    throw new ApiError(500, "Failed to changed password");
  }

  // return
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

// get current user
const getCurrentUser = AsyncHandler(async (req, res) => {
  /*
  <<<<<<<<<<<<<<<<<<<This part is for personal things to implement>>>>>>>>>>>>>>>>>>>>>>>>>
  1. find the user using req.user and also retrurn
  */
  return res
    .status(200)
    .json(
      200,
      new ApiResponse(
        200,
        req.user,
        "Current user details fetched successfully"
      )
    );
});

// Update user profile fullName and email
const updateUserProfile = AsyncHandler(async (req, res) => {
  /*
  <<<<<<<<<<<<<<<<<<<This part is for personal things to implement>>>>>>>>>>>>>>>>>>>>>>>>>
  1. get fullName and email from req.body
  2. check if fullName and email are provided or not
  3. find the user and $set fullName and email also remove password field from response
  4. check if user is available or not
  5. return updated user details
  */
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    throw new ApiError(400, "Full name and email are required");
  }

  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { fullName, email },
    },
    { new: true }
  ).select("-password");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User profile updated successfully"));
});

// Update user avatar
const updateUserAvatar = AsyncHandler(async (req, res) => {
  /*
  <<<<<<<<<<<<<<<<<<<This part is for personal things to implement>>>>>>>>>>>>>>>>>>>>>>>>>
  1. get avatar frrom req.file?.path
  2. check if avatar is provided or not
  4. Delete old avetar
  5. upload avatar to the cloudinary
  6. check if avatar.url is uploaded or not
  7. find the user using req.user?._id and $set the avatar to avatar.url then new true and remove password field from response
  6. return updated user details
  */

  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is missing");
  }

  // Delete the old avatar from cloudinary
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.avatar) {
    const oldAvatarId = user.avatar.split("/").pop().split(".")[0];
    const isDeleted = await deleteFromCloudinary(oldAvatarId);
    if (!isDeleted) {
      throw new ApiError(500, "Failed to delete old avatar from cloudinary");
    }
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);

  if (!avatar.url) {
    throw new ApiError(404, "Error uploading avatar to cloudinary");
  }

  const updateduser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { avatar: avatar.url },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updateduser, "User avatar updated successfully")
    );
});

// Updatte user cover image
const updateUserCoverImage = AsyncHandler(async (req, res) => {
  /*
  <<<<<<<<<<<<<<<<<<<This part is for personal things to implement>>>>>>>>>>>>>>>>>>>>>>>>>
  1. get coverImage from req.file?.path
  2. check if coverImage is provided or not
  5. Delete old cover image
  3. upload coverImage to the cloudinary
  4. check if coverImage.url is uploaded or not
  4. find the user using req.user?._id and $set the coverImage to coverImage.url then new true and remove password field from the response
  6. return updated user details
  */
  const coverImgLocal = req.file?.path;
  if (!coverImgLocal) {
    throw new ApiError(400, "Cover image file is missing");
  }

  // Delete the old cover image from cloudinary
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (user.coverImage) {
    const oldCoverImageId = user.coverImage.split("/").pop().split(".")[0];
    const isDeleted = await deleteFromCloudinary(oldCoverImageId);
    if (!isDeleted) {
      throw new ApiError(
        500,
        "Failed to delete old cover image from cloudinary"
      );
    }
  }

  const coverImage = await uploadOnCloudinary(coverImgLocal);
  if (!coverImage.url) {
    throw new ApiError(404, "Error uploading cover image to cloudinary");
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: { coverImage: coverImage.url },
    },
    { new: true }
  ).select("-password");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedUser, "User cover image updated successfully")
    );
});

// Get user channel profile
const getUserChannelProfile = AsyncHandler(async (req, res) => {
  const { userName } = req.params;
  if (!userName) {
    throw new ApiError(404, "User not found");
  }

  const channel = await User.aggregate([
    {
      $match: {
        userName: userName?.toLowerCase(),
      },
    },
    {
      $lookup: {
        from: "subcriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subcriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscriberCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $project: {
        userName: 1,
        fullName: 1,
        email: 1,
        avatar: 1,
        coverImage: 1,
        subscriberCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(404, "Channel not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, channel[0], "User channel fetched successfully")
    );
});

// Get watch history
const getWatchHistory = AsyncHandler(async (req, res) => {
  const user = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.user._id),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "watchHistory",
        foreignField: "_id",
        as: "watchHistory",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    owner: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              owner: {
                $first: "$owner",
              },
            },
          },
        ],
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user[0].watchHistory,
        "Watch history fetched successfully"
      )
    );
});
export {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  updateUserProfile,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
};
