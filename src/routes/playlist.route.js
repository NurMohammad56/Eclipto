import mongoose from "mongoose";
import { createPlayList, getUserPlaylist} from "../controllers/playlist.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"




const router = new mongoose.Router();

router.post('/create-playlist', verifyJWT, createPlayList);

router.get('/get-user-playlist/:userId', verifyJWT, getUserPlaylist);


export default router