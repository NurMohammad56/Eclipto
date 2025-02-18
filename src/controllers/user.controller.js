import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

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

  const { userName, email, fullName, password } = req.body;
  // console.log("Email : ", email);

  if (
    [userName, email, fullName, password].some(
      (field) => field?.trim("") === ""
    )
  ) {
    throw new ApiError(400, "All fields are required");
  }

  if (!email.inclueds("@")) {
    res.status(400).json({
      message: "Invalid email format",
    });
  }
});

export { registerUser };
