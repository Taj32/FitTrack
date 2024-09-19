import express from 'express';
import { addExercise, getExercise, getRecentExercises, getAllExercises } from '../controllers/exercise.js';
import { isAuth } from '../controllers/auth.js';

const router = express.Router();

router.post('/add', isAuth, addExercise);
router.get('/get', isAuth, getExercise);
router.get('/recent', isAuth, getRecentExercises);
router.get('/getAll', isAuth, getAllExercises); // New route for getting all unique exercises

export default router;