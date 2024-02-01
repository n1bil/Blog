import express from 'express';
import { getUploadUrl, login, register, searchUsers, getProfile, changePassword, updateProfileImg, updateProfile } from '../controller/userController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.post('/signup', register);
router.post('/signin', login);
router.get("/search-users", searchUsers);
router.get("/get-profile/:username", getProfile);
router.get('/get-upload-url', getUploadUrl);
router.put('/change-password', auth, changePassword);
router.put('/update-profile-img', auth, updateProfileImg);
router.put('/update-profile', auth, updateProfile);

export default router;