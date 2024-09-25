import { request } from 'express';
import { User, Friendship, sequelize, Workout } from '../models/index.js';
// import sequelize from '../models/index.js';
import { Op } from 'sequelize';  // Add this line


function formatDateForAzure(date) {
    return date.getFullYear() +
        '-' + String(date.getMonth() + 1).padStart(2, '0') +
        '-' + String(date.getDate()).padStart(2, '0') +
        ' ' + String(date.getHours()).padStart(2, '0') +
        ':' + String(date.getMinutes()).padStart(2, '0') +
        ':' + String(date.getSeconds()).padStart(2, '0') +
        '.' + String(date.getMilliseconds()).padStart(3, '0');
}

export const sendFriendRequest = async (req, res) => {
    const { friendId } = req.body;
    const userEmail = req.email;
    console.log("body:", JSON.stringify(req.body));
    console.log("User email:", userEmail);

    try {
        const user = await User.findOne({ where: { email: userEmail } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.id === friendId) {
            return res.status(400).json({ message: 'You cannot send a friend request to yourself' });
        }

        const existingRequest = await Friendship.findOne({
            where: {
                [Op.or]: [
                    { user_id: user.id, friend_id: friendId },
                    { user_id: friendId, friend_id: user.id }
                ]
            }
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'Friend request already exists or you are already friends' });
        }

        console.log("Creating new friendship request...");

        const now = new Date();
        const formattedDate = formatDateForAzure(now);


        const newRequest = await Friendship.create({
            user_id: user.id,
            friend_id: friendId,
            status: 'pending',
            created_at: null,
            updated_at: null
        });

        console.log('New friendship request created:', newRequest.toJSON());

        res.status(201).json({ message: 'Friend request sent successfully', request: newRequest });
    } catch (error) {
        console.error('Error sending friend request:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            message: 'Error sending friend request',
            error: error.toString(),
            stack: error.stack
        });
    }
};

export const acceptFriendRequest = async (req, res) => {
    const { requestId } = req.params;
    const userEmail = req.email;

    console.log("params: " + requestId);

    try {
        const user = await User.findOne({ where: { email: userEmail } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const request = await Friendship.findOne({
            where: {
                user_id: requestId,
                friend_id: user.id,
                status: 'pending'
            }
        });

        if (!request) {
            return res.status(404).json({ message: 'Friend request not found' });
        }

        request.status = 'accepted';
        await request.save();

        res.status(200).json({ message: 'Friend request accepted', request: request });
    } catch (error) {
        console.error('Error accepting friend request:', error);
        res.status(500).json({ message: 'Error accepting friend request', error: error.message });
    }
};

export const rejectFriendRequest = async (req, res) => {
    const { requestId } = req.params;
    const userEmail = req.email;

    try {
        const user = await User.findOne({ where: { email: userEmail } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const request = await Friendship.findOne({
            where: {
                user_id: requestId,
                friend_id: user.id,
                status: 'pending'
            }
        });

        if (!request) {
            return res.status(404).json({ message: 'Friend request not found' });
        }

        request.status = 'rejected';
        await request.save();

        res.status(200).json({ message: 'Friend request rejected', request: request });
    } catch (error) {
        console.error('Error rejecting friend request:', error);
        res.status(500).json({ message: 'Error rejecting friend request', error: error.message });
    }
};

export const getFriendRequests = async (req, res) => {
    const { requestId } = req.params;
    const userEmail = req.email;

    try {
        const user = await User.findOne({ where: { email: userEmail } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find all requests where the user.id matches friend.id and is pending
        // then put it in a list where it takes the request ID

        const pendingRequests = await Friendship.findAll({
            where: {
                friend_id: user.id,
                status: 'pending'
            },
            include: [{
                model: User,
                as: 'user',
                attributes: ['name']
            }]

        });

        const formattedRequests = pendingRequests.map(request => ({
            requestId: request.id,
            requesterId: request.user_id,
            requesterName: request.user.name,
            //requesterEmail: request.user.email
        }));


        res.json(formattedRequests);

    } catch (error) {
        console.error('Error getting friend requests:', error);
        res.status(500).json({ message: 'Error getting friend request', error: error.message });
    }
}

export const removeFriend = async (req, res) => {
    const { requestId } = req.params;
    const userEmail = req.email;


    try {
        const user = await User.findOne({ where: { email: userEmail } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Start a transaction
        const t = await sequelize.transaction();

        const friend = await Friendship.findOne({
            // where: {
            //     id: requestId,
            //     friend_id: user.id,
            //     status: 'accepted'
            // },
            // transaction: t

            where: {
                [Op.or]: [
                    {
                        user_id: user.id, // from jwt token
                        friend_id: requestId,
                    },
                    {
                        user_id: requestId,
                        friend_id: user.id,
                    }
                ],
                status: 'accepted'
            },
            transaction: t
        });

        console.log("requestId: " + requestId);
        console.log("user.id: " + user.id);

        if (!friend) {
            await t.rollback();
            return res.status(404).json({ message: 'Friend not found' });
        }

        // Remove the friendship
        await friend.destroy({ transaction: t });

        // Commit the transaction
        await t.commit();

        res.status(200).json({ message: 'Friend was deleted' });
    } catch (error) {
        console.error('Error rejecting friend request:', error);
        res.status(500).json({ message: 'Error rejecting friend request', error: error.message });
    }
};

export const getFriends = async (req, res) => {
    const userEmail = req.email;

    try {
        const user = await User.findOne({ where: { email: userEmail } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const friends = await Friendship.findAll({
            where: {
                status: 'accepted',
                [Op.or]: [
                    { user_id: user.id },
                    { friend_id: user.id }
                ]
            },
            include: [
                {
                    model: User,
                    as: 'user',
                    attributes: ['id', 'name', 'email', 'profile_image_url']
                },
                {
                    model: User,
                    as: 'friend',
                    attributes: ['id', 'name', 'email', 'profile_image_url']
                }
            ]
        });

        const formattedFriends = friends.map(friendship => {
            const friend = friendship.user_id === user.id ? friendship.friend : friendship.user;
            return {
                id: friend.id,
                name: friend.name,
                email: friend.email,
                profile_image_url: friend.profile_image_url ? `/auth/profile-image/${encodeURIComponent(friend.profile_image_url.split('/').pop())}` : null
            };
        });

        res.status(200).json({ friends: formattedFriends });
    } catch (error) {
        console.error('Error getting friends:', error);
        res.status(500).json({ message: 'Error getting friends', error: error.message });
    }
};

export const sendWorkoutReminder = async (req, res) => {
    const { friendId } = req.params;
    const userEmail = req.email;

    try {
        const user = await User.findOne({ where: { email: userEmail } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the friendId is actually a friend
        const friendship = await Friendship.findOne({
            where: {
                [Op.or]: [
                    { user_id: user.id, friend_id: friendId },
                    { user_id: friendId, friend_id: user.id }
                ],
                status: 'accepted'
            }
        });

        if (!friendship) {
            return res.status(400).json({ message: 'This user is not your friend' });
        }

        // Check if the friend has done a workout today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const friendWorkoutToday = await Workout.findOne({
            where: {
                user_id: friendId,
                date_created: {
                    [Op.gte]: today
                }
            }
        });

        if (friendWorkoutToday) {
            return res.status(400).json({ message: 'Your friend has already worked out today' });
        }

        // TODO: Implement push notification logic here
        // For now, we'll just return a success message

        res.status(200).json({ message: 'Workout reminder sent successfully' });
    } catch (error) {
        console.error('Error sending workout reminder:', error);
        res.status(500).json({ message: 'Error sending workout reminder', error: error.message });
    }
};

