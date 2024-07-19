import { User, Friendship } from '../models/index.js';

export const sendFriendRequest = async (req, res) => {
    // const { friendId } = req.body;  // Rename recipientId to friendId
    // const userId = req.userId;

    // console.log('req.userId:', req.userId);
    // console.log('req.body:', req.body);

    const { friendId } = req.body;
    const userEmail = req.email;
    console.log("body: " + req.body);

    const user = await User.findOne({ where: { email: userEmail } });
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }

    //const requesterId = user.id;

    try {
        const existingRequest = await Friendship.findOne({
            where: {
                user_id: user.id,
                friend_id: friendId
            }
        });

        if (existingRequest) {
            return res.status(400).json({ message: 'Friend request already sent' });
        }

        const newRequest = await Friendship.create({
            user_id: user.id,
            friend_id: friendId,
            status: 'pending'
        });

        res.status(201).json({ message: 'Friend request sent successfully', request: newRequest });
    } catch (error) {
        console.error('Error sending friend request:', error);
        res.status(500).json({ message: 'Error sending friend request', error: error.message });
    }
};

export const acceptFriendRequest = async (req, res) => {
    const { requestId } = req.params;
    const userId = req.userId;

    try {
        const request = await Friendship.findOne({
            where: {
                id: requestId,
                recipientId: userId,
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
    const userId = req.userId;

    try {
        const request = await Friendship.findOne({
            where: {
                id: requestId,
                recipientId: userId,
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

export const getFriends = async (req, res) => {
    const userId = req.userId;

    try {
        const friends = await Friendship.findAll({
            where: {
                status: 'accepted',
                [Op.or]: [
                    { requesterId: userId },
                    { recipientId: userId }
                ]
            },
            include: [
                {
                    model: User,
                    as: 'requester',
                    attributes: ['id', 'name', 'email']
                },
                {
                    model: User,
                    as: 'recipient',
                    attributes: ['id', 'name', 'email']
                }
            ]
        });

        const formattedFriends = friends.map(friendship => {
            const friend = friendship.requesterId === userId ? friendship.recipient : friendship.requester;
            return {
                id: friend.id,
                name: friend.name,
                email: friend.email
            };
        });

        res.status(200).json({ friends: formattedFriends });
    } catch (error) {
        console.error('Error getting friends:', error);
        res.status(500).json({ message: 'Error getting friends', error: error.message });
    }
};