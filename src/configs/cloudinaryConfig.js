import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
// https://api.cloudinary.com/v1_1/{{cloud_name}}/:resource_type/upload

export const socialLoginSystem = async (request, response, next) => {
  try {
    const { name, email, image, accountType } = request.body;
    const user = await User.findOne({ email });

    if (user && user.accountType === accountType) {
      const token = generateJwt({
        id: user._id,
        email: user.email,
        role: user.role,
      });
      return response.status(201).json({
        success: true,
        message: 'User Login successfully',
        user,
        token,
      });
    } else if (user && user.accountType !== accountType) {
    } else {
      const createUserName = name.toLowerCase().replace(/\s+/g, '-');
      const newUser = await User.create({
        name,
        email,
        username: createUserName,
        image: {
          imageUrl: image,
          publicId: '',
        },
        accountType: accountType,
      });
      const token = generateJwt({
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
      });
      return response.status(201).json({
        success: true,
        message: 'User Register successfully',
        user: newUser,
        token,
      });
    }
  } catch (error) {
    return next(error);
  }
};
