import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Upload on Cloudinary method
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      // console.error("No file provided for upload");
      return null;
    }

    if (!fs.existsSync(localFilePath)) {
      console.error("File not found on local path", localFilePath);
      return null;
    }

    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto", // Auto-detected type of the uploaded file
    });

    // console.log("File is uploaded on cloudinary", response.url);

    // when finished, delete the local file
    fs.unlinkSync(localFilePath); // Delete after upload

    return response;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error.message);
    fs.unlinkSync(localFilePath); // Delete if failed to upload
    return null;
  }
};

export { uploadOnCloudinary };
