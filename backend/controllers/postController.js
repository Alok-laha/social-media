const {getShard} = require('../config/shardMiddleware');
const {successResponse, errorResponse} = require("../utils/response");
const shardModels = require('../config/shardModels');

const getPosts = async (req, res) => {
    try {
        const userId = req.params.userId;
        if(!userId) return res.status(400).json({message: "User id not found", status: false})
        const dbInstance = getShard(userId);

        const details = await dbInstance.Post.findAll({where: {userId}});
        return res.status(200).json({message: "User details", data: details, status: true});
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({message: error.message, status: false});
    }
}

const createPost = async (req, res) =>{
    try {
        // So when we create new posts then all the people who follow me should get the post in their timeline. The followers might be spread out across the shard.
        // So find all the users and their shards. Then push the post in the shard timeline_post table for all the users. 
        const userId = req.body.userId;
        const {content, imageUrl} = req.body;
        const queryPromises = new Array();
        for(let i=0;i<3;i++){
            queryPromises.push(shardModels[i].Follow.findAll({where: {followedId: userId}, attributes: ['followerId']}));
        }
        const result = await Promise.all(queryPromises);
        // now we need to create the records in the shards
        const postPromises = new Array();
        const isoDate = new Date(Date.now()).toISOString();
        const newPost = await getShard(userId).Post.create({
            userId,
            content,
            imageUrl,
            createdAt: isoDate
        });

        result.forEach(shardRes=>{
            shardRes.forEach(follower=> {
                postPromises.push(getShard(follower.followerId).Timeline.create({
                    followerId: follower.followerId,
                    content: content,
                    imageUrl: imageUrl,
                    likesCount: 0,
                    commentsCount: 0,
                    createdAt: isoDate,
                    postId: newPost.id
                }));
            })
        });

        await Promise.all(postPromises);
        
        return successResponse(res, "Post created successfully", newPost);
    } catch (error) {
        console.log(error.message);
        return errorResponse(res, error.message);
    }
}
module.exports = {getPosts,createPost};