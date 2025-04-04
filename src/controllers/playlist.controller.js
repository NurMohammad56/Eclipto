import mongoose, { isValidObjectId } from "mongoose";
import { AsyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlist.models.js";

// Create playlist
export const createPlayList = AsyncHandler(async (req, res) => {
    try {
        const { name, description } = req.body;
        const userId = req.user;

        if (!name?.trim() && !description) {
            throw new ApiError(400, "Name is required");
        }

        if (!isValidObjectId(userId)) {
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

        if (!isValidObjectId(userId)) {
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

        if (!isValidObjectId(playlistId)) {
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

// Add a video to the playlist
export const addVideoToPlaylist = AsyncHandler(async (req, res) => {
    try {
        const { playlistId, videoId } = req.body;

        if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
            throw new ApiError(400, "Playlist ID and Video ID are required");
        }

        const playlist = await Playlist.findByIdAndUpdate(
            playlistId,
            {
                $push: { videos: isValidObjectId }
            },
            { new: true, runValidators: true }
        )

        if (!playlist) {
            throw new ApiError(404, "Playlist not found");
        }

        res.status(200).json(
            new ApiResponse(200, playlist, "Video added successfully to playlist")
        );
    } catch (error) {
        console.error("Error while adding video to playlist", error);
        throw new ApiError(500, error.message || "Failed to add video to playlist");
    }
})

// Remove a video from the playlist
export const removeVideoFromPlaylist = AsyncHandler(async (req, res) => {
    try {
        const { playlistId } = req.params;
        const { videoId } = req.body;
        if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
            throw new ApiError(400, "Playlist ID and Video ID are required");
        }

        const playlist = await Playlist.findByIdAndUpdate(
            playlistId,
            {
                $pull: { videos: videoId }
            },
            { new: true, runValidators: true }
        )
        if (!playlist) {
            throw new ApiError(404, "Playlist not found");
        }

        res.status(200).json(
            new ApiResponse(200, playlist, "Video removed successfully from playlist")
        );

    } catch (error) {
        console.error("Error while removing video from playlist", error);
        throw new ApiError(500, error.message || "Failed to remove video from playlist");
    }
})

// Delete playlist
export const deletePlaylist = AsyncHandler(async (req, res) => {
    try {
        const { playlistId } = req.params;
        if (!!isValidObjectId(playlistId)) {
            throw new ApiError(400, "Playlist ID is required");
        }

        const playlist = await Playlist.findByIdAndDelete(playlistId);
        if (!playlist) {
            throw new ApiError(404, "Playlist not found");
        }

        res.status(200).json(
            new ApiResponse(200, playlist, "Playlist deleted successfully")
        );
    } catch (error) {
        console.error("Error while deleting playlist", error);
        throw new ApiError(500, error.message || "Failed to delete playlist");
    }
})

// Update playlist
export const updatePlaylist = AsyncHandler(async (req, res) => {
    try {
        const { playlistId } = req.params;
        const { name, description } = req.body;

        if (!isValidObjectId(playlistId)) {
            throw new ApiError(400, "Playlist ID is required");
        }

        if (!name && !description) {
            throw new ApiError(400, "Name or description is required");
        }

        const playlist = await Playlist.findByIdAndUpdate(
            playlistId,
            {
                $set: { name, description }
            },
            { new: true }
        )

        if (!playlist) {
            throw new ApiError(404, "Playlist not found");
        }

        res.status(200).json(
            new ApiResponse(200, playlist, "Playlist updated successfully")
        );
    } catch (error) {
        console.error("Error while updating playlist", error);
        throw new ApiError(500, error.message || "Failed to update playlist");
    }
})
