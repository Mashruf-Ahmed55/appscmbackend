import createHttpError from 'http-errors';
import User from '../models/auth.model';
import { generateJwt } from '../utils/generateJwt';
import uploadImage, { removeImage } from '../utils/uploadImage';

export const registerUser = async (request, response, next) => {
  try {
    const { name, email, password } = request.body;

    if (!name || !email || !password) {
      return next(createHttpError(400, 'All fields are required'));
    }

    const isUserExist = await User.findOne({ email });

    if (isUserExist) {
      return next(createHttpError(400, 'User already exists. Please login!'));
    }

    const createUserName = name.toLowerCase().replace(/\s+/g, '-');

    let imageData;
    if (request.file) {
      const res = await uploadImage(
        request.file.buffer,
        'users-profile-images'
      );
      imageData = {
        imageUrl: res.secure_url,
        publicId: res.public_id,
      };
    }

    const user = await User.create({
      name,
      email,
      password,
      username: createUserName,
      ...(imageData && { image: imageData }),
      accountType: 'email',
    });

    return response.status(201).json({
      success: true,
      message: 'User created successfully',
      user,
    });
  } catch (error) {
    return next(error);
  }
};

export const loginUser = async (request, response, next) => {
  try {
    const { email, password } = request.body;

    if (!email) {
      return next(createHttpError(400, 'Email is required'));
    }

    const isUser = await User.findOne({ email });

    if (!isUser) {
      return next(
        createHttpError(400, 'User does not exist. Please register!')
      );
    }

    if (isUser.accountType !== 'email') {
      return next(
        createHttpError(400, `Please use ${isUser.accountType} login`)
      );
    }

    // Only check password if it was sent

    const isPasswordMatch = await isUser.matchPassword(password);

    if (!isPasswordMatch) {
      return next(createHttpError(400, 'Invalid credentials'));
    }

    // Generate token anyway (password check passed or skipped)
    const token = generateJwt({
      id: isUser._id,
      email: isUser.email,
      role: isUser.role,
    });

    response.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'None',
    });

    return response.status(200).json({
      success: true,
      message: 'Login successful',
      user: isUser,
      token,
    });
  } catch (error) {
    return next(error);
  }
};

export const profile = async (request, response, next) => {
  try {
    const { id } = request.user;
    const user = await User.findById(id).select('-password');
    if (!user) {
      return next(createHttpError(404, 'User not found'));
    }
    return response.status(200).json({
      success: true,
      message: 'User profile',
      user,
    });
  } catch (error) {
    return next(error);
  }
};

export const socialLoginSystem = async (request, response, next) => {
  try {
    const { name, email, image, accountType } = request.body;
    const user = await User.findOne({ email });

    if (user) {
      if (user.accountType === accountType) {
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
      } else {
        let providerMsg = '';
        switch (user.accountType) {
          case 'google':
            providerMsg = 'Please use Google login!';
            break;
          case 'github':
            providerMsg = 'Please use GitHub login!';
            break;
          default:
            providerMsg = 'Please use email login!';
        }
        return next(createHttpError(400, providerMsg));
      }
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

export const getLoggedInUser = async (request, response, next) => {
  try {
    const { id } = request.user;
    const user = await User.findById(id).select('-password');
    if (!user) {
      return next(createHttpError(404, 'User not found'));
    }
    return response.status(200).json({
      success: true,
      message: 'User profile',
      user,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateProfile = async (request, response, next) => {
  try {
    const { id } = request.user;
    const { name, email } = request.body;

    const user = await User.findById(id);
    if (!user) {
      return next(createHttpError(404, 'User not found'));
    }
    if (user.email === email) {
      return next(createHttpError(400, 'Please use another email'));
    }

    let imageData;
    if (request.file) {
      if (user.image?.publicId) {
        await removeImage(user.image.publicId);
      }
      const res = await uploadImage(
        request.file.buffer,
        'users-profile-images'
      );
      imageData = { imageUrl: res.secure_url, publicId: res.public_id };
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (imageData) user.image = imageData;

    await user.save();

    return response.status(200).json({
      success: true,
      message: 'User profile updated',
      user,
    });
  } catch (error) {
    next(error);
  }
};
