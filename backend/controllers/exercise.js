import { User, Workout, Exercise, sequelize } from '../models/index.js';


// import User from '../models/user.js';
// import Exercise from '../models/exercise.js'; // You'll need to create this model
import { Op } from 'sequelize';



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
        const user = await User.findOne({ where: { email: userEmail } });
        if (!user) {
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

        const exercises = await Exercise.findAll({
            where: whereClause,
            order: [['date', 'ASC']]
        });

        res.json(exercises);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching exercises', error: error.message });
    }
};