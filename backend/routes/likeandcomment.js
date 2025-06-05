const router = require('express').Router();
const postController = require('../controllers/postController');

router.get('/likes/:postId', postController.getPosts);
router.get('/comments/:postId', postController.getPosts);

router.post('/likes/:postId', postController.getPosts);
router.post('/comments/:postId', postController.getPosts);



module.exports = router;