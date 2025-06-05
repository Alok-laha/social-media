const router = require('express').Router();
const postController = require('../controllers/postController');

router.get('/posts/:userId', postController.getPosts);

module.exports = router;