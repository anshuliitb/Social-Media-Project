import multer from "multer";
import path from "path";
import fs from "fs";

const imageFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG and PNG images are allowed!"));
  }
};

function storageReturn(folderName, filenamePrefix) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const folderPath = `src/uploads/${folderName}`;
      fs.mkdirSync(folderPath, { recursive: true });
      cb(null, folderPath);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${filenamePrefix}-${Date.now()}${ext}`);
    },
  });

  return storage;
}

const storageAvatar = storageReturn("userAvatars", "avatar");
const storagePostImage = storageReturn("postImages", "postImage");

export const uploadAvatar = multer({
  storage: storageAvatar,
  fileFilter: imageFileFilter,
});
export const uploadPostImage = multer({
  storage: storagePostImage,
  fileFilter: imageFileFilter,
});
