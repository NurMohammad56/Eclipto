import { Router } from "express";
import {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideoById,
} from "../controllers/video.controller.js";
import upload from "../middlewares/multer.middleware.js";

const router = Router();

router.get("/", getAllVideos);
router.post(
  "/upload-video",
  upload.fields([
    { name: "videoFile", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  publishAVideo
);
router.route("/getSingleVideo/:videoId").get(getVideoById);
router.route("/updateVideo/:videoId").patch(updateVideoById);
export default router;
