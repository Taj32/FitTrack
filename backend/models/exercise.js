import { DataTypes } from 'sequelize';
import sequelize from '../utils/database.js';

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
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  workout_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'exercises',
  timestamps: false
});

export default Exercise;