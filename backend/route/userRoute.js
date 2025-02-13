const authentication = require('../middlewares/authMiddleware');
const { getProfile, getStreak, uploadAvatar, getCoins, getAchivement, getUserProgress } = require('../controllers/userController');
const { restrictTo } = require('../controllers/authController');
const ROLE_IDS = require('../enum/roles');
const streakCheck = require('../middlewares/streakMiddleware');
const upload = require('../middlewares/multer');

const router = require('express').Router();

router.route('/:id')
    .get(authentication, streakCheck, getProfile);

router.route('/:id/streak').get(authentication, streakCheck, getStreak)
router.route('/:id/coins').get(authentication, streakCheck, getCoins)

router.route('/:id/achievements').get(getAchivement)
router.route('/:id/progress').get(authentication, getUserProgress)

router.post('/upload', upload.single('image'), authentication, uploadAvatar)

module.exports = router;