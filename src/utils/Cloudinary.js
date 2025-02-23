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

    // check if response has a URL then delete local file and return the response
    if (response?.url) {
      fs.unlinkSync(localFilePath);
      return response;
    } else {
      console.error("No URL found in the Cloudinary response");
      fs.unlinkSync(localFilePath);
      return null;
    }
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error.message);
    fs.unlinkSync(localFilePath); // Delete if failed to upload
    return null;
  }
};

export { uploadOnCloudinary };
