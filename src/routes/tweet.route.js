import mongoose from "mongoose";
import {createTweet, getUserTweets, updateTweet, deleteTweet} from "../controllers/tweet.controller.js"
import verifyJWT from "../middlewares/auth.middleware.js"

const router = new mongoose.Router();

router.post('/create-tweet', verifyJWT, createTweet);

router.get('/get-user-tweets/:userId', verifyJWT, getUserTweets);

router.put('/update-tweet/:tweetId', verifyJWT, updateTweet);

router.delete('/delete-tweet/:tweetId', verifyJWT, deleteTweet);

export default router;