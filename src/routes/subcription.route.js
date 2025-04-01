import mongoose from "mongoose";
import {toggleSubscribe, getUserChannelSubscribers} from "../controllers/subscription.controller.js"
import verifyJWT from "../middlewares/auth.middleware.js"

const router = new mongoose.Router();

router.post('/toggle-subscribe', verifyJWT, toggleSubscribe);

router.get('/get-user-subscribers/:channelId', verifyJWT, getUserChannelSubscribers);

export default router;