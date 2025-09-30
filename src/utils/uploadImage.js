import cloudinary from '../configs/cloudinaryConfig.js';

const uploadImage = async (filePath, folder) => {
  try {
    // return actual Cloudinary upload result
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );

      uploadStream.end(filePath);
    });

    return result; // now you can await uploadImage() outside
  } catch (error) {
    throw error;
  }
};

export default uploadImage;

export const removeImage = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    throw error;
  }
};
