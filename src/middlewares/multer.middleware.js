import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("This console from the multer middleware", file);
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage: storage });

export default upload;
