import { Router } from 'express';
import upload from '../configs/multerConfig.js';
import {
  loginUser,
  profile,
  registerUser,
  socialLoginSystem,
  updateProfile,
} from '../controllers/auth.controller.js';
import verifyUser from '../middlewares/verifyUser.js';

const authRouter = Router();

authRouter.post('/register', upload.single('profileImage'), registerUser);
authRouter.post('/login', loginUser);
authRouter.post('/social', socialLoginSystem);
authRouter.get('/profile', verifyUser, profile);
authRouter.put(
  '/update-profile',
  verifyUser,
  upload.single('profileImage'),
  updateProfile
);

export default authRouter;
