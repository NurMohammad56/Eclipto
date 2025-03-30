import mongoose from "mongoose";
import { createPlayList, getUserPlaylist, getPlaylistById, addVideoToPlaylist, removeVideoFromPlaylist, deletePlaylist, updatePlaylist} from "../controllers/playlist.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"




const router = new mongoose.Router();

router.post('/create-playlist', verifyJWT, createPlayList);

router.get('/get-user-playlist/:userId', verifyJWT, getUserPlaylist);

router.get('/get-playlist/:playlistId', verifyJWT, getPlaylistById);

router.post('/add-video-to-playlist/:playlistId', verifyJWT, addVideoToPlaylist);

router.put('/removevideo-from-playlist/:playlistId', verifyJWT, removeVideoFromPlaylist);

router.delete('/delete-playlist/:playlistId', verifyJWT, deletePlaylist);

router.patch('/update-playlist/:playlistId', verifyJWT, updatePlaylist);


export default router