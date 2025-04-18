const multer = require("multer");
const fs = require("fs");

const Storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = "public";
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    cb(null, fileName);
  },
});

const upload = multer({
  storage: Storage,
});

const profile = upload.fields([
  { name: "logo", maxCount: 1 },
  { name: "cover", maxCount: 1 },
]);

module.exports = profile;
