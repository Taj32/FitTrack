// controllers/workout.js

import { User, Workout, Exercise, sequelize, Friendship } from '../models/index.js';
import { Op } from 'sequelize';


// import User from '../models/user.js';
// import Workout from '../models/workout.js';
// import Exercise from '../models/exercise.js';

export const getUserWorkouts = async (req, res) => {
    const userEmail = req.email;

    try {
        console.log('Fetching workouts for user:', userEmail);

        const user = await User.findOne({ where: { email: userEmail } });
        if (!user) {
            console.log('User not found for email:', userEmail);
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('User found:', user.id);

        try {
            const workouts = await Workout.findAll({
                where: { user_id: user.id },
                include: [{
                    model: Exercise,
                    as: 'Exercises', // Correct alias
                    attributes: ['id', 'exercise_name', 'weight', 'reps', 'sets', 'date']
                }],
                order: [['date_created', 'DESC']]
            });

            console.log('Workouts fetched:', workouts.length);

            // Transform the data into the required format
            const formattedWorkouts = workouts.map(workout => ({
                id: workout.id,
                name: workout.name,
                date_created: workout.date_created,
                user_id: workout.user_id,
                exercises: workout.Exercises?.map(exercise => ({ // Ensure this is always an array
                    id: exercise.id,
                    name: exercise.exercise_name,
                    weight: exercise.weight,
                    reps: exercise.reps,
                    sets: exercise.sets,
                    date: exercise.date
                })) || [] // Default to an empty array if null/undefined
            }));

            res.json(formattedWorkouts);
        } catch (workoutError) {
            console.error('Error fetching workouts:', workoutError);

            if (workoutError.parent && workoutError.parent.errors) {
                console.error('Detailed errors:', workoutError.parent.errors);
            }

            throw workoutError;
        }

    } catch (error) {
        console.error('Error in getUserWorkouts:', error);
        res.status(500).json({
            message: 'Error fetching user workouts',
            error: error.message,
            stack: error.stack,
            details: error.parent ? error.parent.message : 'No additional details'
        });
    }
};



export const getSpecificWorkout = async (req, res) => {
    const userEmail = req.email;
    const { workoutId } = req.params;

    try {

    } catch (error) {
        console.error('Error fetching the user workout:', error);
        res.status(500).json({ message: 'Error fetching the user workouts', error: error.message });
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

        // Start a transaction
        const t = await sequelize.transaction();

        try {
            // Find the workout
            const workout = await Workout.findOne({
                where: { id: workoutId, user_id: user.id },
                transaction: t
            });

            if (!workout) {
                await t.rollback();
                return res.status(404).json({ message: 'Workout not found or not owned by user' });
            }

            console.log('Found workout:', workout.toJSON());

            // Remove associated exercises
            const deletedExercisesCount = await Exercise.destroy({
                where: { workout_id: workoutId },
                transaction: t
            });

            console.log(`Deleted ${deletedExercisesCount} exercises`);

            // Remove the workout
            await workout.destroy({ transaction: t });

            // Commit the transaction
            await t.commit();

            res.json({ 
                message: 'Workout and associated exercises removed successfully',
                deletedExercisesCount
            });
        } catch (error) {
            // If there's an error, rollback the transaction
            await t.rollback();
            throw error;
        }
    } catch (error) {
        console.error('Error removing workout and exercises:', error);
        res.status(500).json({ message: 'Error removing workout and exercises', error: error.message });
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

export const getFriendsRecentWorkouts = async (req, res) => {
    const userEmail = req.email;

    try {
        const user = await User.findOne({ where: { email: userEmail } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('User:', user.toJSON()); // Log user data

        // Get user's friends
        const friendships = await Friendship.findAll({
            where: {
                status: 'accepted',
                [Op.or]: [
                    { user_id: user.id },
                    { friend_id: user.id }
                ]
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: User,
                    as: 'friend',
                    attributes: ['id', 'name', 'email']
                }
            ]
        });

        console.log('Friendships:', JSON.stringify(friendships, null, 2)); // Log friendships

        const friendIds = friendships.reduce((acc, friendship) => {
            const friendId = friendship.user_id === user.id ? friendship.friend_id : friendship.user_id;
            if (friendId) {
                acc.push(friendId);
            }
            return acc;
        }, []);

        console.log('Friend IDs:', friendIds); // Log friend IDs

        if (friendIds.length === 0) {
            return res.status(200).json({ message: 'No friends found', workouts: [] });
        }

        // Get recent workouts of friends
        const recentWorkouts = await Workout.findAll({
            where: {
                user_id: {
                    [Op.in]: friendIds
                },
                date_created: {
                    [Op.gte]: new Date(new Date() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                }
            },
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: Exercise,
                    attributes: ['exercise_name', 'weight', 'reps', 'sets', 'date']
                }
            ],
            order: [['date_created', 'DESC']],
            limit: 50 // Limit to 50 most recent workouts
        });

        console.log('Recent Workouts:', JSON.stringify(recentWorkouts, null, 2)); // Log recent workouts

        // Format the workouts data
        const formattedWorkouts = recentWorkouts.map(workout => ({
            id: workout.id,
            name: workout.name,
            date_created: workout.date_created,
            user_id: workout.user_id,
            user: workout.User ? {
                id: workout.User.id,
                name: workout.User.name,
                email: workout.User.email
            } : null,
            exercises: workout.Exercises ? workout.Exercises.map(exercise => ({
                name: exercise.exercise_name,
                weight: exercise.weight,
                reps: exercise.reps,
                sets: exercise.sets,
                date: exercise.date
            })) : []
        }));

        res.status(200).json({ 
            workouts: formattedWorkouts 
        });
    } catch (error) {
        console.error('Error getting friends\' recent workouts:', error);
        res.status(500).json({ 
            message: 'Error getting friends\' recent workouts', 
            error: error.message,
            stack: error.stack // Include the error stack for debugging
        });
    }
};