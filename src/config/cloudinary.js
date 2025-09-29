import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

// Konfigurasi Cloudinary

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    let uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'students' },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
    streamifier.createReadStream(file.buffer).pipe(uploadStream);
  });
};

export default cloudinary;