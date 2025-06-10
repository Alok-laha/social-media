const router = require('express').Router();
const userRouter = require('./user');
const postRouter = require('./post');

router.use(userRouter);
router.use(postRouter);
router.get('/', (req, res) => res.status(200).send("Welcome to social media backend"));


module.exports = router;