import { Router } from "express";
import {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideoById,
} from "../controllers/video.controller.js";
import upload from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/", verifyJWT, getAllVideos);
router.post(
  "/upload-video",
  verifyJWT,
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  publishAVideo
);
router.get("/getSingleVideo/:videoId", verifyJWT, getVideoById);
router.route("/updateVideo/:videoId", verifyJWT, updateVideoById);
export default router;
