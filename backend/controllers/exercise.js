import User from '../models/user.js';
import Exercise from '../models/exercise.js'; // You'll need to create this model

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



export const getExercises = async (req, res) => {
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