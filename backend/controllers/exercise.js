import { format } from 'mysql2';
import { User, Workout, Exercise, sequelize , Friendship} from '../models/index.js';


// import User from '../models/user.js';
// import Exercise from '../models/exercise.js'; // You'll need to create this model

import { Op } from 'sequelize';

export const getAllExercises = async (req, res) => {
    const userEmail = req.email; // This comes from the isAuth middleware

    try {
        const user = await User.findOne({ where: { email: userEmail } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get all unique exercise names for the user
        const uniqueExercises = await Exercise.findAll({
            where: { userId: user.id },
            attributes: [
                [Exercise.sequelize.fn('DISTINCT', Exercise.sequelize.col('exercise_name')), 'exercise_name']
            ],
            order: [['exercise_name', 'ASC']]
        });

        // Format the response
        const formattedExercises = uniqueExercises.map((exercise, index) => ({
            id: index + 1, // Generate a unique id
            title: exercise.exercise_name,
            imageSource: null // We'll use the default image on the frontend
        }));

        res.json(formattedExercises);
    } catch (error) {
        console.error('Error fetching all exercises:', error);
        res.status(500).json({ message: 'Error fetching all exercises', error: error.message });
    }
};

export const addExercise = async (req, res) => {
    const { exercise_name, weight, reps, sets, date } = req.body;
    const userEmail = req.email; // This comes from the isAuth middleware

    try {
        const user = await User.findOne({ where: { email: userEmail } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const exercise = await Exercise.create({
            userId: user.id,
            exercise_name,
            weight,
            reps,
            sets,
            date
        });

        res.status(201).json({ message: 'Exercise added successfully', exercise });
    } catch (error) {
        res.status(500).json({ message: 'Error adding exercise', error: error.message });
    }
};

export const getRecentExercises = async (req, res) => {
    const userEmail = req.email; // This comes from the isAuth middleware

    try {
        const user = await User.findOne({ where: { email: userEmail } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get the three most recent unique exercises
        const recentExercises = await Exercise.findAll({
            where: { userId: user.id },
            attributes: [
                'exercise_name',
                [Exercise.sequelize.fn('MAX', Exercise.sequelize.col('date')), 'max_date']
            ],
            group: ['exercise_name'],
            order: [[Exercise.sequelize.fn('MAX', Exercise.sequelize.col('date')), 'DESC']],
            limit: 3
        });

        // For each recent exercise, get all its data points
        const exerciseData = await Promise.all(recentExercises.map(async (exercise) => {
            const data = await Exercise.findAll({
                where: {
                    userId: user.id,
                    exercise_name: exercise.exercise_name
                },
                attributes: ['weight', 'date'],
                order: [['date', 'ASC']]
            });

            return {
                exercise_name: exercise.exercise_name,
                color: getColorForExercise(exercise.exercise_name),
                data: data.map(d => ({
                    value: d.weight,
                    label: formatDate(d.date)// Format date as YYYY-MM-DD
                }))
            };
        }));

        res.json(exerciseData);
    } catch (error) {
        console.error('Error fetching recent exercises:', error);
        res.status(500).json({ message: 'Error fetching recent exercises', error: error.message });
    }
};

// Helper function to assign colors to exercises
function getColorForExercise(exerciseName) {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98FB98'];
    const hash = exerciseName.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    return colors[hash % colors.length];
}

// Helper function to format date
function formatDate(dateString) {
    // Assuming dateString is in 'YYYY-MM-DD' format
    // If it's in a different format, adjust the parsing accordingly
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
        // If date is invalid, return the original string
        return dateString;
    }
    return date.toISOString().split('T')[0]; // Format as 'YYYY-MM-DD'
}

export const getExercise = async (req, res) => {
    const userEmail = req.email;
    const { exercise_name, start_date, end_date } = req.query;

    try {
        console.log('Fetching exercise for user:', userEmail);
        console.log('Query params:', { exercise_name, start_date, end_date });

        const user = await User.findOne({ where: { email: userEmail } });
        if (!user) {
            console.log('User not found for email:', userEmail);
            return res.status(404).json({ message: 'User not found' });
        }

        let whereClause = { userId: user.id };
        if (exercise_name) {
            whereClause.exercise_name = exercise_name;
        }
        if (start_date && end_date) {
            whereClause.date = {
                [Op.between]: [start_date, end_date]
            };
        }

        console.log('Where clause:', JSON.stringify(whereClause));

        const exercises = await Exercise.findAll({
            where: whereClause,
            order: [['date', 'ASC']]
        });

        console.log('Exercises found:', exercises.length);
        if (exercises.length > 0) {
            console.log('Sample exercise:', JSON.stringify(exercises[0].toJSON()));
        } else {
            console.log('No exercises found');
        }

        res.json(exercises);
    } catch (error) {
        console.error('Error in getExercise:');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        if (error.sql) {
            console.error('SQL Query:', error.sql);
        }
        if (error.parameters) {
            console.error('Parameters:', error.parameters);
        }
        console.error('Stack trace:', error.stack);
        
        res.status(500).json({ 
            message: 'Error fetching exercises', 
            error: error.message,
            stack: error.stack 
        });
    }
};

export const getFriendsRecentExercises = async (req, res) => {
    const userEmail = req.email;

    try {
        const user = await User.findOne({ where: { email: userEmail } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

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

        console.log('Friendships:', JSON.stringify(friendships, null, 2)); // Log friendships for debugging

        const friends = friendships.reduce((acc, friendship) => {
            const friend = friendship.user_id === user.id ? friendship.friend : friendship.user;
            if (friend && friend.id) {
                acc.push({
                    id: friend.id,
                    name: friend.name || 'Unknown',
                    email: friend.email || 'Unknown'
                });
            }
            return acc;
        }, []);

        console.log('Friends:', JSON.stringify(friends, null, 2)); // Log friends for debugging

        const friendIds = friends.map(friend => friend.id);

        // Get recent exercises of friends
        const recentExercises = await Exercise.findAll({
            where: {
                userId: {
                    [Op.in]: friendIds
                },
                date: {
                    [Op.gte]: new Date(new Date() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                }
            },
            include: [
                {
                    model: User,
                    attributes: ['id', 'name', 'email']
                }
            ],
            order: [['date', 'DESC']],
            limit: 50 // Limit to 50 most recent exercises
        });

        // Format the exercises data
        const formattedExercises = recentExercises.map(exercise => ({
            id: exercise.id,
            exercise_name: exercise.exercise_name,
            weight: exercise.weight,
            reps: exercise.reps,
            sets: exercise.sets,
            date: formatDate(exercise.date),
            user: exercise.User ? {
                id: exercise.User.id,
                name: exercise.User.name || 'Unknown',
                email: exercise.User.email || 'Unknown'
            } : null
        }));

        res.status(200).json({ 
            friends: friends,
            exercises: formattedExercises 
        });
    } catch (error) {
        console.error('Error getting friends\' recent exercises:', error);
        res.status(500).json({ message: 'Error getting friends\' recent exercises', error: error.message, stack: error.stack });
    }
};

// Helper function to format date (if not already defined)
function formatDateFriends(date) {
    return date instanceof Date ? date.toISOString().split('T')[0] : 'Unknown Date';
}