import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./env",
});

connectDB()
  .then(() => {
    app.on("Error", (err) => {
      console.log(`Error while listening on ${process.env.PORT}`, err);
      throw err;
    });

    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server is running at port: ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log(`Error connecting to database`, error);
    throw error;
  });
