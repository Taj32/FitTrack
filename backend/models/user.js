import { DataTypes, Sequelize } from 'sequelize';
import sequelize from '../utils/database.js';

const User = sequelize.define('users', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
    },
    name: {
        type: Sequelize.STRING,
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
    },
    verificationToken: {
        type: Sequelize.STRING,
        allowNull: true,
    },
    verified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
    },
    profile_image_url: {
        type: Sequelize.STRING,
        allowNull: true,
    },
});

export default User;