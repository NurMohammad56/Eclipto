import { Router } from "express";
import {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideoById,
  deleteVideo,
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
router.patch("/updateVideo/:videoId", verifyJWT, updateVideoById);

router.delete("/deleteVideo/:videoId", verifyJWT, deleteVideo);
export default router;
