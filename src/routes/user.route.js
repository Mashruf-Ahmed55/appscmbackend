import Router from 'express';
import {
  analysisData,
  deleteUser,
  getAllUsers,
  getUser,
  updateUser,
} from '../controllers/user.controller';
import { protectAdmin } from '../middlewares/protectAdmin';
import verifyUser from '../middlewares/verifyUser';

const userRouter = Router();

userRouter.get('/all-users', verifyUser, protectAdmin, getAllUsers);
userRouter.get('/get-user/:id', verifyUser, getUser);
userRouter.put('/update-user:id/role', protectAdmin, updateUser);
userRouter.delete('/delete-user/:id', protectAdmin, deleteUser);
userRouter.get('/analytics', verifyUser, protectAdmin, analysisData);

export default userRouter;
