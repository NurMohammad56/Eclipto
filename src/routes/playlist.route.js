import mongoose from "mongoose";
import { createPlayList} from "../controllers/playlist.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"




const router = new mongoose.Router();

router.post('/create-playlist', verifyJWT, createPlayList);


export default router