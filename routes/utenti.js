const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware'); // Import mancante
const { register, login, getUserInfo } = require('../controllers/utentiController');

router.post('/register', register);
router.post('/login', login);
router.get('/:id', auth, getUserInfo);

module.exports = router;