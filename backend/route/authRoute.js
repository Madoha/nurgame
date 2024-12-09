const { signup, login, googleLogin, googleCallback, googleLogout, logout, refreshToken, forgotPassword, resetPassword, changePassword } = require('../controllers/authController'); 
const authentication = require('../middlewares/authMiddleware');

const router = require('express').Router();

router.route('/signup').post(signup);
router.route('/login').post(login);
router.route('/google').get(googleLogin);
router.route('/google/callback').get(googleCallback);
// router.route('/is-signed-in').get(isSignedIn);
router.route('/google-logout').get(googleLogout);
router.route('/logout').post(authentication, logout);
router.route('/refresh').post(refreshToken);
router.route('/forgot-password').post(forgotPassword);
router.route('/reset-password/:token').post(resetPassword);
router.route('/change-password').post(authentication, changePassword);

module.exports = router;