import express from 'express';
import { sendFriendRequest, acceptFriendRequest, rejectFriendRequest,
     getFriends, removeFriend, getFriendRequests, sendWorkoutReminder } from '../controllers/friend.js';
import {getFriendsRecentExercises} from '../controllers/exercise.js';
import { getFriendsRecentWorkouts } from '../controllers/workout.js';
import { isAuth } from '../controllers/auth.js';

const router = express.Router();

router.post('/send-request', isAuth, sendFriendRequest);
router.post('/accept-request/:requestId', isAuth, acceptFriendRequest);
router.post('/reject-request/:requestId', isAuth, rejectFriendRequest);
router.post('/remove-friend/:requestId', isAuth, removeFriend);
router.get('/getPendingRequests', isAuth, getFriendRequests);
router.post('/send-workout-reminder/:friendId', isAuth, sendWorkoutReminder);


router.get('/get-friends', isAuth, getFriends);
router.get('/recent-friends', isAuth, getFriendsRecentExercises);
router.get('/recent-friend-workouts', isAuth, getFriendsRecentWorkouts);


export default router;