import { DataTypes } from 'sequelize';
import sequelize from '../utils/database.js';
import User from './user.js';

const Friendship = sequelize.define('Friendship', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    friend_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM('pending', 'accepted', 'rejected'),
        defaultValue: 'pending',
        allowNull: false
    }
}, {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    underscored: true
});

// Update these associations
Friendship.belongsTo(User, { 
    as: 'user', 
    foreignKey: 'user_id'
});
Friendship.belongsTo(User, { 
    as: 'friend', 
    foreignKey: 'friend_id'
});

export default Friendship;