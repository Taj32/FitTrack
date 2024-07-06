// controllers/workout.js

import { User, Workout, Exercise, sequelize } from '../models/index.js';


// import User from '../models/user.js';
// import Workout from '../models/workout.js';
// import Exercise from '../models/exercise.js';

export const getUserWorkouts = async (req, res) => {
    const userEmail = req.email;

    try {
        const user = await User.findOne({ where: { email: userEmail } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const workouts = await Workout.findAll({
            where: { user_id: user.id },
            order: [['date_created', 'DESC']],
            include: [{
                model: Exercise,
                attributes: ['exercise_name', 'weight', 'reps', 'sets', 'date'],
                order: [['date', 'DESC']]
            }]
        });

        console.log("RAW", JSON.stringify(workouts, null, 2)); // Log raw workout data


        // Format the response
        const formattedWorkouts = workouts.map(workout => ({
            id: workout.id,
            name: workout.name,
            date_created: workout.date_created,
            user_id: workout.user_id,
            exercises: workout.Exercises.map(exercise => ({
                name: exercise.exercise_name,
                weight: exercise.weight,
                reps: exercise.reps,
                sets: exercise.sets,
                date: exercise.date
            }))
        }));

        res.json(formattedWorkouts);
    } catch (error) {
        console.error('Error fetching user workouts:', error);
        res.status(500).json({ message: 'Error fetching user workouts', error: error.message });
    }
};

export const addWorkout = async (req, res) => {
    const { name, exercises } = req.body;
    const userEmail = req.email;

    try {
        console.log('Request body:', req.body);
        console.log('User email:', userEmail);

        const user = await User.findOne({ where: { email: userEmail } });
        console.log('User:', user ? user.toJSON() : 'User not found');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('Creating workout...');
        const workout = await Workout.create({
            name,
            date_created: new Date(),
            user_id: user.id,
            exercises: req.body.exercises
        });
        console.log('Created workout:', workout.toJSON());

        res.status(201).json({ 
            message: 'Workout added successfully', 
            workout: workout.toJSON()
        });
    } catch (error) {
        console.error('Error in addWorkout:', error);
        res.status(500).json({ message: 'Error adding workout', error: error.message });
    }
};

export const removeWorkout = async (req, res) => {
    const { workoutId } = req.params;
    const userEmail = req.email;

    try {
        const user = await User.findOne({ where: { email: userEmail } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const workout = await Workout.findOne({
            where: { id: workoutId, user_id: user.id }
        });

        if (!workout) {
            return res.status(404).json({ message: 'Workout not found or not owned by user' });
        }

        await workout.destroy();

        res.json({ message: 'Workout removed successfully' });
    } catch (error) {
        console.error('Error removing workout:', error);
        res.status(500).json({ message: 'Error removing workout', error: error.message });
    }
};

export const completeWorkout = async (req, res) => {
    const { workoutId } = req.params;
    const userEmail = req.email;
    const { exerciseData } = req.body;

    try {
        const user = await User.findOne({ where: { email: userEmail } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const workout = await Workout.findOne({
            where: { id: workoutId, user_id: user.id }
        });

        if (!workout) {
            return res.status(404).json({ message: 'Workout not found or not owned by user' });
        }

        const exercisesToCreate = [];

        workout.exercises.forEach((exercise, index) => {
            const exerciseInfo = exerciseData[index];
            for (let i = 0; i < exercise.sets; i++) {
                exercisesToCreate.push({
                    exercise_name: exercise.name,
                    weight: exerciseInfo.weights[i],
                    reps: exerciseInfo.reps[i],
                    sets: 1, // Each entry represents one set
                    date: new Date(),
                    userId: user.id,
                    workout_id: workout.id  // Add this line to associate with the workout

                });
            }
        });

        const createdExercises = await Exercise.bulkCreate(exercisesToCreate);

        res.status(200).json({ 
            message: 'Workout completed successfully', 
            exercises: createdExercises 
        });
    } catch (error) {
        console.error('Error completing workout:', error);
        res.status(500).json({ message: 'Error completing workout', error: error.message });
    }
};