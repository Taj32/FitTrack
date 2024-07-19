import express from 'express';
import { sendFriendRequest, acceptFriendRequest, rejectFriendRequest, getFriends } from '../controllers/friend.js';
import { isAuth } from '../controllers/auth.js';

const router = express.Router();

router.post('/send-request', isAuth, sendFriendRequest);
router.post('/accept-request/:requestId', isAuth, acceptFriendRequest);
router.post('/reject-request/:requestId', isAuth, rejectFriendRequest);
router.get('/get-friends', isAuth, getFriends);

export default router;