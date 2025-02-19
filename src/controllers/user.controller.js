import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "./../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = AsyncHandler(async (req, res) => {
  // get user details from frontend or postman
  // validation - not empty
  // check if user already exists : email, userName
  // check for images and avatar
  // upload them to cloudinary, then again check the avatar still exist or not
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user created successfully or not
  // return success or error message

  // get user details
  const { userName, email, fullName, password } = req.body;
  // console.log("Email : ", email);

  // validation
  if (
    [userName, email, fullName, password].some(
      (field) => field?.trim("") === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  // check email format
  if (!email.includes("@")) {
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

  // then again check avatar and the coverImage still exist or not
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
  const createdUser = await User.find(user._id).select(
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

export { registerUser };
