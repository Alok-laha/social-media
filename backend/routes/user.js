const router = require('express').Router();
const userController = require('../controllers/user');

router.get('/profile/:userId', userController.getUser);

module.exports = router;