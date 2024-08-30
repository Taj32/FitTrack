import { DataTypes } from 'sequelize';
import sequelize from '../utils/database.js';

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
    type: DataTypes.DATE,
    allowNull: false
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  exercises: {
    type: DataTypes.TEXT,  // Change this from JSON to TEXT
    allowNull: false,
    defaultValue: '[]'  // Set a default value
  }
}, {
  tableName: 'workouts',
  timestamps: false // This tells Sequelize not to expect createdAt and updatedAt fields
});

export default Workout;