import express from 'express';
import multer from 'multer';

import { signup, login, isAuth, getName, getUsers, verifyEmail, uploadProfileImage, serveProfileImage, getImageURL } from '../controllers/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/login', login);

router.post('/signup', signup);

router.get('/private', isAuth);

router.get('/getName', isAuth, getName);  // New route

router.get('/getUsers', isAuth, getUsers);  // New route

router.get('/verify/:token', verifyEmail );

router.post('/upload-profile-image', isAuth, upload.single('image'), uploadProfileImage);

router.get('/profile-image/:imageId', isAuth, serveProfileImage);

router.get('/getImageURL', isAuth, getImageURL);


// exercises

router.get('/public', (req, res, next) => {
    res.status(200).json({ message: "here is your public resource" });
});


// will match any other path
router.use('/', (req, res, next) => {
    res.status(404).json({error : "page not found!"});
});

export default router;