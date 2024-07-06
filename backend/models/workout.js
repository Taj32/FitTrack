import { DataTypes } from 'sequelize';
import sequelize from '../utils/database.js';
import User from './user.js';
import Exercise from './exercise.js';

const Workout = sequelize.define('Workout', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    date_created: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    exercises: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: []
    }
}, {
    timestamps: false
});

// Workout.belongsTo(User, { foreignKey: 'user_id' });
// Workout.hasMany(Exercise);
// User.hasMany(Workout, { foreignKey: 'user_id' });

export default Workout;