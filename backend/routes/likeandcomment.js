const router = require('express').Router();
const postController = require('../controllers/postController');

router.get('/likes/:postId', postController.getPosts);
router.get('/comments/:postId', postController.getPosts);

// So when we are giving likes or comments on a posts then basically we need fan-out the count for update. For that again we need to find the shards of the follower. which is expensive as it will be a fan out read operation. So if we can cache the shard numbers for each popolar post then I think we can get rid of these fan out read opearation.

router.post('/likes/:postId', postController.getPosts);
router.post('/comments/:postId', postController.getPosts);



module.exports = router;