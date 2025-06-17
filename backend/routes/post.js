const router = require('express').Router();
const postController = require('../controllers/postController');
const rateLimiter = require('../config/rateLimit');

router.get('/posts/:userId', postController.getPosts);
router.post('/post', rateLimiter({windowSizeInSeconds: 30, maxRequests: 2, action: 'create-post'}) ,postController.createPost);


module.exports = router;