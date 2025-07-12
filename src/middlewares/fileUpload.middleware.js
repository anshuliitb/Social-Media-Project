import multer from "multer";
import path from "path";

function storageReturn(folderName, filenamePrefix) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const folderPath = `src/uploads/${folderName}`;
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

export const uploadAvatar = multer({ storage: storageAvatar });
export const uploadPostImage = multer({ storage: storagePostImage });
