import { Router } from 'express';
import {
  createAnnouncement,
  deleteAnnouncement,
  getAllAnnouncements,
  updateAnnouncement,
} from '../controllers/announcement.controller.js';
import { protectAdmin } from '../middlewares/protectAdmin.js';
import verifyUser from '../middlewares/verifyUser.js';

const announcementRouter = Router();

announcementRouter
  .route('/get-all-announcements')
  .get(verifyUser, getAllAnnouncements);

announcementRouter
  .route('/create-announcement')
  .post(verifyUser, protectAdmin, createAnnouncement);

announcementRouter
  .route('/update-announcement/:id')
  .put(verifyUser, protectAdmin, updateAnnouncement);

announcementRouter
  .route('/delete-announcement/:id')
  .delete(verifyUser, protectAdmin, deleteAnnouncement);

export default announcementRouter;
