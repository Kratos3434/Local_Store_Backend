import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary } from './cloudinary.config';

export const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => ({
    folder: 'uploads',
    resource_type: 'auto',
    // 🚨 CRITICAL for iPhone uploads
      format: undefined,
    public_id: `${Date.now()}-${file.originalname}`,
  }),
});