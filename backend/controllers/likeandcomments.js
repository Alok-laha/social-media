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
        // Get the people who liked in this post
        const postId = req.params.postId;
        let likePromises = [];

        // Fan out query
        for (let i = 0; i < 3; i++) {
            likePromises.push(shardModels[i].Like.findAll({ where: { postId }, attributes: ['userId'] }));
        }
        
        const promiseResult = await Promise.all(likePromises);
        const userPromises = [];
        // const alluser = []
        promiseResult.forEach(result=>{
            if(result.length > 0){
                result.forEach(user=>{
                    userPromises.push(getShard(user.userId).User.findByPk(user.userId, {attributes: ['username','email', 'profilePicture']}));
                    // alluser.push(user.userId);
                })
            }
        });

        // Need to do another fan out query to get the users details
        // 1. Use IN operator on all shard
        // 2. Build one by one query depending upon shard index
        const users = await Promise.all(userPromises);

        // const users = await Promise.all([shardModels[0].User.findAll({where: {id: {[Op.in]: alluser}}}), shardModels[1].User.findAll({where: {id: {[Op.in]: alluser}}}), shardModels[2].User.findAll({where: {id: {[Op.in]: alluser}}})]);

        return successResponse(res, "Liked by these users", users);
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: error.message, status: false });
    }
}

const getComments = async (req, res) => {
    try {
        // Get the people who commented in this post
        const postId = req.params.postId;
        let commentPromises = [];

        // Fan out query
        for (let i = 0; i < 3; i++) {
            commentPromises.push(shardModels[i].Comment.findAll({ where: { postId }, attributes: ['userId'] }));
        }
        
        const promiseResult = await Promise.all(commentPromises);
        const userPromises = [];
        // const alluser = []
        promiseResult.forEach(result=>{
            if(result.length > 0){
                result.forEach(user=>{
                    userPromises.push(getShard(user.userId).User.findByPk(user.userId, {attributes: ['username','email', 'profilePicture']}));
                    // alluser.push(user.userId);
                })
            }
        });

        // Need to do another fan out query to get the users details
        // 1. Use IN operator on all shard
        // 2. Build one by one query depending upon shard index
        const users = await Promise.all(userPromises);

        // const users = await Promise.all([shardModels[0].User.findAll({where: {id: {[Op.in]: alluser}}}), shardModels[1].User.findAll({where: {id: {[Op.in]: alluser}}}), shardModels[2].User.findAll({where: {id: {[Op.in]: alluser}}})]);

        return successResponse(res, "Commented by these users", users);
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: error.message, status: false });
    }
}

const createLike = async (req, res) => {
    try {
        const postId = req.params.postId;
        if (!postId) return errorResponse(res, "Post id not found", { status: false });

        const { userId } = req.body;
        // Comments are stored in same shard of the user
        const dbInstance = getShard(userId);
        let totalLikes = 0;

        if (redisClient) {
            // Check if key exists
            const redisPost = await redisClient.hGet(postId.toString(), 'likes')

            if (redisPost) {
                console.log('Post already exists. Updating selected fields...');

                // Update only selected fields
                await redisClient.hSet(postId, {
                    likes: Number(redisPost) + 1
                });
                totalLikes = Number(redisPost);
            } else {
                console.log('post does not exist. Creating new record...');

                // Let's get the total comment count from all the shard for this post
                for (let i = 0; i < 3; i++) {
                    totalLikes += await shardModels[i].Like.count({ where: { postId } });
                }
                // Create new user hash
                await redisClient.hSet(postId, {
                    comments: 0,
                    likes: totalLikes + 1
                });

            }
        }

        await Promise.all([dbInstance.Like.create({ userId, postId, createdAt: new Date(Date.now()).toISOString() }), shardModels[0].Timeline.update({ likesCount: totalLikes + 1 }, { where: { postId } }), shardModels[1].Timeline.update({ likesCount: totalLikes + 1 }, { where: { postId } }), shardModels[2].Timeline.update({ likesCount: totalLikes + 1 }, { where: { postId } })]);

        return successResponse(res, "Reacted successfully", { totalLikes, post: postId });

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
        let totalComments = 0;

        if (redisClient) {
            // Check if key exists
            const redisPost = await redisClient.hGet(postId.toString(), 'comments')

            if (redisPost) {
                console.log('Post already exists. Updating selected fields...');

                // Update only selected fields
                await redisClient.hSet(postId, {
                    comments: Number(redisPost) + 1
                });
                totalComments = Number(redisPost);
            } else {
                console.log('post does not exist. Creating new record...');

                // Let's get the total comment count from all the shard for this post
                for (let i = 0; i < 3; i++) {
                    totalComments += await shardModels[i].Comment.count({ where: { postId } });
                }
                // Create new user hash
                await redisClient.hSet(postId, {
                    comments: totalComments + 1,
                    likes: 0
                });

            }
        }

        await Promise.all([dbInstance.Comment.create({ userId, postId, content, createdAt: new Date(Date.now()).toISOString() }), shardModels[0].Timeline.update({ commentsCount: totalComments + 1 }, { where: { postId } }), shardModels[1].Timeline.update({ commentsCount: totalComments + 1 }, { where: { postId } }), shardModels[2].Timeline.update({ commentsCount: totalComments + 1 }, { where: { postId } })]);

        return successResponse(res, "Commented successfully", { comment: content, post: postId });

    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: error.message, status: false });
    }
}

module.exports = { getComments, getLikes, createComment, createLike };