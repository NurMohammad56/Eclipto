import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "./../models/user.models.js";
import { Playlist } from "../models/playlist.models.js";

// Create playlist
export const createPlayList = AsyncHandler(async (req, res) => {
    try {
        const { name, description } = req.body;
        const userId = req.user;

        if (!name?.trim() && !description) {
            throw new ApiError(400, "Name is required");
        }

        if (!userId) {
            throw new ApiError(401, "Unauthorized user");
        }

        const existingPlaylist = await Playlist.findOne(
            {
                name,
                userId
            }
        )

        if (existingPlaylist) {
            throw new ApiError(400, "Playlist with the same name already exists");
        }

        const createPlaylist = await Playlist.create(
            {
                name: name.tirm(),
                description: description.trim(),
                owner: userId,
                videos: []
            }
        )
        if (!createPlaylist) {
            throw new ApiError(500, "Failed to create playlist");
        }

        res.status(200).json(
            new ApiResponse(200, createPlaylist, "Playlist created successfully")
        )
    } catch (error) {
        console.error("Error while creating playlist", error);
        throw new ApiError(500, error.message || "Failed to create playlist");
    }

})

// Get a playlist by user
export const getUserPlaylist = AsyncHandler(async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            throw new ApiError(400, "User ID is required");
        }
        const playlist = await playlist.findById(userId);

        if (!playlist) {
            throw new ApiError(404, "Playlist not found");
        }

        res.status(200).json(
            new ApiResponse(200, playlist, "Playlist fetched successfully")
        );
    } catch (error) {
        console.error("Error while fetching playlist", error);
        throw new ApiError(500, error.message || "Failed to fetch playlist");

    }
})

// Get playlist by plalistID
export const getPlaylistById = AsyncHandler(async (req, res) => {
    try {
        const { playlistId } = req.params;

        if (!playlistId) {
            throw new ApiError(400, "Playlist ID is required");
        }

        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            throw new ApiError(404, "Playlist not found");
        }

        res.status(200).json(
            new ApiResponse(200, playlist, "Playlist fetched successfully")
        );

    } catch (error) {
        console.error("Error while fetching playlist", error);
        throw new ApiError(500, error.message || "Failed to fetch playlist");
    }
})
