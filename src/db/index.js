import mongoose from "mongoose";
import { DB_NAME } from "./../constant.js";

// Connect to MongoDB
const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );
    // console.log(connectionInstance);

    console.log(
      `\nMongoDB Connected !! DB HOST: ${connectionInstance.connection.host}`
    );
  } catch (error) {
    console.log(`Error connecting to MongoDB`, error);
    process.exit(1);
  }
};

export default connectDB;
