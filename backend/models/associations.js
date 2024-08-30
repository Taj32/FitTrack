import sequelize from './utils/database.js';
import User from './models/user.js';
import Workout from './models/workout.js';
import Exercise from './models/exercise.js';

const syncDatabase = async () => {
  try {
    // Sync users table
    await User.sync({ force: true });
    console.log('Users table created successfully');

    // Sync workouts table
    await Workout.sync({ force: true });
    console.log('Workouts table created successfully');

    // Sync exercises table
    await Exercise.sync({ force: true });
    console.log('Exercises table created successfully');

    // Now add the associations
    User.hasMany(Exercise);
    User.hasMany(Workout);
    Workout.belongsTo(User);
    Workout.hasMany(Exercise);
    Exercise.belongsTo(User);
    Exercise.belongsTo(Workout);

    // Sync the associations
    await sequelize.sync({ alter: true });
    console.log('Associations synced successfully');

    // Start your server
    app.listen(5000, () => {
      console.log(`Server is running on port 5000`);
    });
  } catch (error) {
    console.error('Unable to sync database:', error);
  }
};

syncDatabase();