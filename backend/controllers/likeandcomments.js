const {getShard} = require('../config/shardMiddleware');

const getLikes = async (req, res) => {
    try {
        const postId = req.params.postId;
        if(!postId) return res.status(400).json({message: "Post id not found", status: false})
        const dbInstance = getShard(userId);

        const details = await dbInstance.User.findByPk(userId);
        return res.status(200).json({message: "User details", data: details, status: true});
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({message: error.message, status: false});
    }
}

const getComments = async (req, res) => {
    try {
        const userId = req.params.userId;
        if(!userId) return res.status(400).json({message: "User id not found", status: false})
        const dbInstance = getShard(userId);

        const details = await dbInstance.User.findByPk(userId);
        return res.status(200).json({message: "User details", data: details, status: true});
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({message: error.message, status: false});
    }
}

const createLike = async (req, res) => {
    try {
        const userId = req.params.userId;
        if(!userId) return res.status(400).json({message: "User id not found", status: false})
        const dbInstance = getShard(userId);

        const details = await dbInstance.User.findByPk(userId);
        return res.status(200).json({message: "User details", data: details, status: true});
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({message: error.message, status: false});
    }
}

const createComment = async (req, res) => {
    try {
        const userId = req.params.userId;
        if(!userId) return res.status(400).json({message: "User id not found", status: false})
        const dbInstance = getShard(userId);

        const details = await dbInstance.User.findByPk(userId);
        return res.status(200).json({message: "User details", data: details, status: true});
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({message: error.message, status: false});
    }
}

module.exports = {getComments, getLikes, createComment, createLike};