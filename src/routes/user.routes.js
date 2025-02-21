import { Router } from "express";
import {
  loginUser,
  registerUser,
  logOutUser,
  refreshAccessToken,
} from "../controllers/user.controller.js";
import upload from "../middlewares/multer.middleware.js";
import { verifyJWT } from "./../middlewares/auth.middleware.js";

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
export default router;
