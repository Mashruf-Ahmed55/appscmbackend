import { Router } from 'express';
import upload from '../configs/multerConfig.js';
import {
  createCourt,
  deleteCourt,
  getAllCourts,
  getSingleCourt,
  updateCourt,
} from '../controllers/court.controller.js';
import { protectAdmin } from '../middlewares/protectAdmin.js';
import verifyUser from '../middlewares/verifyUser.js';

const courtRouter = Router();

courtRouter.get('/all-courts', getAllCourts);
courtRouter.get('/get-court/:id', verifyUser, getSingleCourt);
courtRouter.post(
  '/create-court',
  verifyUser,
  protectAdmin,
  upload.single('image'),
  createCourt
);
courtRouter.put('/update-court/:id', protectAdmin, updateCourt);
courtRouter.delete('/delete-court/:id', verifyUser, protectAdmin, deleteCourt);

export default courtRouter;
