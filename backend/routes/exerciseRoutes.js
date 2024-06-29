import express from 'express';
import { addExercise, getExercises } from '../controllers/exercise.js';
import { isAuth } from '../controllers/auth.js';

const router = express.Router();

router.post('/add', isAuth, addExercise);
router.get('/get', isAuth, getExercises);

export default router;