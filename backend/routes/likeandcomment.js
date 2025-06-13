const router = require('express').Router();
const LikeCommentCtrl = require('../controllers/likeandcomments');

router.get('/likes/:postId', LikeCommentCtrl.getLikes);
router.get('/comments/:postId', LikeCommentCtrl.getComments);

// So when we are giving likes or comments on a posts then basically we need fan-out the count for update. For that again we need to find the shards of the follower. which is expensive as it will be a fan out read operation. So if we can cache the shard numbers for each popolar post then I think we can get rid of these fan out read opearation.

router.post('/likes/:postId', LikeCommentCtrl.createLike);
router.post('/comments/:postId', LikeCommentCtrl.createComment);



module.exports = router;