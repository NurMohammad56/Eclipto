import mongoose from "mongoose";
import {toggleSubscribe, getUserChannelSubscribers, getSubscribedChannels} from "../controllers/subscription.controller.js"
import verifyJWT from "../middlewares/auth.middleware.js"

const router = new mongoose.Router();

router.post('/toggle-subscribe', verifyJWT, toggleSubscribe);

router.get('/get-all-subscribers/:channelId', verifyJWT, getUserChannelSubscribers);

router.get('/get-subscribed-channels/:userId', verifyJWT, getSubscribedChannels);

export default router;