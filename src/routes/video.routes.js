import { Router } from "express";
import {
  getAllVideos,
  publishAVideo,
  getVideoById,
} from "../controllers/video.controller.js";

const router = Router();

router
  .get("/")
  .get(getAllVideos)
  .post(
    upload.fields([
      { name: "videoFile", maxCount: 1 },
      { name: "thumbnail", maxCount: 1 },
    ]),
    publishAVideo
  );

router.route("/getSingleVideo/:videoId").get(getVideoById);
export default router;
