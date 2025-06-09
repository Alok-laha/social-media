const router = require('express').Router();
const userController = require('../controllers/user');

router.get('/profile/:userId', userController.getUser);
router.get('/timeline/:userId', userController.getTimeLine);

module.exports = router;