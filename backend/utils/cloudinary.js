import dotenv from 'dotenv';
import cloudinary from 'cloudinary';

dotenv.config();

// Cloudinary configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const imageUploader = async (file, foldername) => {
  try {
    const result = await cloudinary.v2.uploader.upload(file, {
      folder: foldername ?? 'images',
    });
    return result;
  } catch (error) {
    throw new Error(error);
  }
}

export const deleteImageOrVideo = async (publicId, type) => {
  try {
    const result = await cloudinary.v2.api.delete_resources([publicId], {
      invalidate: true,
      resource_type: type
    });
    return result;
  } catch (error) {
    throw new Error(error);
  }
}


export const imageUrlGenerator = async (publicId) => {
  try {
    const result = await cloudinary.v2.url(publicId);
    return result;
  } catch (error) {
    throw new Error(error);
  }
}

export const videoUploader = async (file, foldername, type) => {
  try {
    const result = await cloudinary.v2.uploader.upload(file, { resource_type: type, folder: foldername ?? 'videos' });
    return result;
  } catch (error) {
    throw new Error(error);
  }
}


export const videoUrlGenerator = async (publicId, type) => {
  try {
    const result = await cloudinary.v2.url(publicId, { resource_type: type });
    return result;
  } catch (error) {
    throw new Error(error);
  }
}
