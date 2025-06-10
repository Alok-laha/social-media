const router = require('express').Router();
const postController = require('../controllers/postController');

router.get('/posts/:userId', postController.getPosts);
router.post('/post', postController.createPost);


module.exports = router;