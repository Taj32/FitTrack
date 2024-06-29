import { DataTypes } from 'sequelize';
import sequelize from '../utils/database.js'; // Adjust this import based on your database setup
import User from './user.js';

const Exercise = sequelize.define('Exercise', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },

    exercise_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    weight: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    reps: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    sets: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    userId: {  // Add this field
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
}, {
    timestamps: false // diosables automatic timestamp field
});

Exercise.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Exercise, { foreignKey: 'userId' });

export default Exercise;