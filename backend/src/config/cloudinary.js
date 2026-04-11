import { v2 as cloudinary } from 'cloudinary';
import { VITE_CLOUDINARY_CLOUD_NAME, VITE_CLOUDINARY_API_KEY, VITE_CLOUDINARY_API_SECRET } from './env.js';

cloudinary.config({
  cloud_name: VITE_CLOUDINARY_CLOUD_NAME,
  api_key: VITE_CLOUDINARY_API_KEY,
  api_secret: VITE_CLOUDINARY_API_SECRET,
});

export default cloudinary;
