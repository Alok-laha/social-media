const {getShard} = require('../config/shardMiddleware');
const {successResponse, errorResponse} = require('../utils/response');

const getUser = async (req, res) => {
    try {
        const userId = req.params.userId;
        if(!userId) return res.status(400).json({message: "User id not found", status: false});
        const dbInstance = getShard(userId);

        const details = await dbInstance.User.findByPk(userId);
        return successResponse(res,"User details",details);
    } catch (error) {
        console.log(error.message);
        return errorResponse(res,error.message);
    }
}

const getTimeLine = async (req, res) => {
    try {
        const userId = req.params.userId;
        if(!userId) return res.status(400).json({message: "User id not found", status: false});

        const shard = getShard(userId);
        const timelinePosts = await shard.Timeline.findAll({offset: 0, limit: 10});

        return successResponse(res,"Timeline posts", timelinePosts);
    } catch (error) {
        console.log(error.message);
        return errorResponse(res, error.message);
    }
}

module.exports = {getUser, getTimeLine};