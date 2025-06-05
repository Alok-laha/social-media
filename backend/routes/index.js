const router = require('express').Router();
const userRouter = require('./user');
const postRouter = require('./post');

router.use(userRouter);
router.use(postRouter);

module.exports = router;