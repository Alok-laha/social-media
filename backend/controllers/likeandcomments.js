const { getShard } = require('../config/shardMiddleware');
const shardModels = require('../config/shardModels');
const { successResponse, errorResponse } = require('../utils/response');
const { getRedisClient } = require('../config/redis');

let redisClient;
(async () => {
    redisClient = await getRedisClient();
})();

const getLikes = async (req, res) => {
    try {
        const userData = await redisClient.hGetAll("1258");

        console.log(userData);
        return successResponse(res, "Redis data", userData);
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: error.message, status: false });
    }
}

const getComments = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) return res.status(400).json({ message: "User id not found", status: false })
        const dbInstance = getShard(userId);

        const details = await dbInstance.User.findByPk(userId);
        return res.status(200).json({ message: "User details", data: details, status: true });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: error.message, status: false });
    }
}

const createLike = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) return res.status(400).json({ message: "User id not found", status: false })
        const dbInstance = getShard(userId);

        const details = await dbInstance.User.findByPk(userId);
        return res.status(200).json({ message: "User details", data: details, status: true });
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: error.message, status: false });
    }
}

const createComment = async (req, res) => {
    try {
        const postId = req.params.postId;
        if (!postId) return errorResponse(res, "Post id not found", { status: false });

        const { userId, content } = req.body;
        // Comments are stored in same shard of the user
        const dbInstance = getShard(userId);

        // Let's get the total comment count from all the shard for this post
        let totalComments = 0;
        for (let i = 0; i < 3; i++) {
            totalComments += await shardModels[i].Comment.count({ where: { postId } });
        }

        await Promise.all([dbInstance.Comment.create({ userId, postId, content, createdAt: new Date(Date.now()).toISOString() }), shardModels[0].Timeline.update({ commentsCount: totalComments + 1 }, { where: { postId } }), shardModels[1].Timeline.update({ commentsCount: totalComments + 1 }, { where: { postId } }), shardModels[2].Timeline.update({ commentsCount: totalComments + 1 }, { where: { postId } })]);

        if (redisClient) {
            // Check if key exists
            const exists = await redisClient.exists(postId);

            if (exists) {
                console.log('Post already exists. Updating selected fields...');

                // Update only selected fields
                await redisClient.hSet(postId, {
                    comments: totalComments + 1
                });

            } else {
                console.log('post does not exist. Creating new record...');

                // Create new user hash
                await redisClient.hSet(postId, {
                    comments: totalComments + 1,
                    likes: 0
                });

            }
        }

        return successResponse(res, "Commented successfully", { comment: content, post: postId });

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: error.message, status: false });
    }
}

module.exports = { getComments, getLikes, createComment, createLike };