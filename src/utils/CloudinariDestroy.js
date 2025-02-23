import { v2 as cloudinary } from "cloudinary";

const deleteFromCloudinary = async (publicId) => {
  try {
    const response = cloudinary.uploader.destroy(publicId);
    if (response.result == "ok") {
      console.log("Image deleted successfully from Cloudinary");
      return true;
    } else {
      console.error("Failed to delete image from Cloudinary", response);
      return false;
    }
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error.message);
    return false;
  }
};

export { deleteFromCloudinary };
