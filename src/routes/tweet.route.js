import mongoose from "mongoose";
import {createTweet} from "../controllers/tweet.controller.js"
import verifyJWT from "../middlewares/auth.middleware.js"

const router = new mongoose.Router();

router.post('/create-tweet', verifyJWT, createTweet);

export default router;