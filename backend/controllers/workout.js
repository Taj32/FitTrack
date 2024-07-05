import User from '../models/user.js';
import Workout from '../models/workout.js';
import Exercise from '../models/exercise.js';

export const getUserWorkouts = async (req, res) => {
    const userEmail = req.email; // This comes from the isAuth middleware

    try {
        const user = await User.findOne({ where: { email: userEmail } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const workouts = await Workout.findAll({
            where: { user_id: user.id },
            include: [{
                model: Exercise,
                through: { attributes: [] } // This will exclude the join table attributes
            }],
            order: [['date_created', 'DESC']]
        });

        res.json(workouts);
    } catch (error) {
        console.error('Error fetching user workouts:', error);
        res.status(500).json({ message: 'Error fetching user workouts', error: error.message });
    }
};

export const addWorkout = async (req, res) => {
    const { name, exercises } = req.body;
    const userEmail = req.email; // This comes from the isAuth middleware

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
            user_id: user.id  // Make sure this matches your model definition (user_id or userId)
        });
        console.log('Created workout:', workout.toJSON());

        if (exercises && exercises.length > 0) {
            console.log('Adding exercises to workout...');
            const exerciseInstances = await Exercise.findAll({
                where: { id: exercises.map(e => e.id) }
            });
            await workout.addExercises(exerciseInstances);
            console.log('Exercises added to workout');
        }

        console.log('Fetching workout with exercises...');
        const workoutWithExercises = await Workout.findOne({
            where: { id: workout.id },
            include: [Exercise]
        });
        console.log('Fetched workout with exercises:', workoutWithExercises ? workoutWithExercises.toJSON() : 'Workout not found');

        res.status(201).json({ 
            message: 'Workout added successfully', 
            workout: workoutWithExercises ? workoutWithExercises.toJSON() : null 
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

