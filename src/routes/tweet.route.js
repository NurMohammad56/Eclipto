import mongoose from "mongoose";
import {createTweet, getUserTweets} from "../controllers/tweet.controller.js"
import verifyJWT from "../middlewares/auth.middleware.js"

const router = new mongoose.Router();

router.post('/create-tweet', verifyJWT, createTweet);

router.get('/get-user-tweets/:userId', verifyJWT, getUserTweets);

export default router;