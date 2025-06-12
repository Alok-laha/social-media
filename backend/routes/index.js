const router = require('express').Router();
const userRouter = require('./user');
const postRouter = require('./post');
const likeCommentRouter = require('./likeandcomment');

router.use(userRouter);
router.use(postRouter);
router.use(likeCommentRouter);
router.get('/', (req, res) => res.status(200).send("Welcome to social media backend"));


module.exports = router;