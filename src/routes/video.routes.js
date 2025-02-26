import { Router } from "express";
import {
  getAllVideos,
  publishAVideo,
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

export default router;
