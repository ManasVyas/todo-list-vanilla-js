const multer = require("multer");

const fileStorageEng = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()} -- ${file.originalname}`);
  },
});

const upload = multer({
  storage: fileStorageEng,
  limits: {
    fileSize: 1024 * 1024 * 10,
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype !== "image/png" &&
      file.mimetype !== "image/jpg" &&
      file.mimetype !== "image/jpeg"
    ) {
      cb(new Error("Only .png .jpg and .jpeg formats are allowed!"), false);
    } else {
      cb(null, true);
    }
  },
}).single("profilePicture");

module.exports = upload;
