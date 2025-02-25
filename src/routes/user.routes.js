import { Router } from "express";
import {
  loginUser,
  registerUser,
  logOutUser,
  refreshAccessToken,
  changePassword,
  getCurrentUser,
  updateUserProfile,
  updateUserAvatar,
  updateUserCoverImage,
  getUserChannelProfile,
  getWatchHistory,
} from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middleware.js";
import { verifyJWT } from "./../middlewares/auth.middleware.js";
import upload from "./../middlewares/multer.middleware";

const router = Router();

// register
router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

// login
router.route("/login").post(loginUser);

// logout
router.route("/logout").get(verifyJWT, logOutUser);

// refresh token
router.route("/refresh-token").post(refreshAccessToken);

// change passoword
router.route("/change-password").post(verifyJWT, changePassword);

// get user channel profile
router.route("/current-user").get(verifyJWT, getCurrentUser);

// update user profile
router.route("/update-account").patch(verifyJWT, updateUserProfile);

// update user avatar
router
  .route("/avatar")
  .patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

// update user cover image
router
  .route("/coverImage")
  .patch(verifyJWT, upload.single("coverImage"), updateUserCoverImage);

// get user channel
router.route("/channel/:userName").get(verifyJWT, getUserChannelProfile);

// get watch historu
router.route("/watchHistory").get(verifyJWT, getWatchHistory);
export default router;
