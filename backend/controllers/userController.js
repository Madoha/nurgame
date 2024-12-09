const streak = require("../db/models/streak");
const user = require("../db/models/user");
// const uploadImage = require("../services/cloudinary/uploadImage");
const AchievementService = require('../services/achievements/achievementService');
const userService = require('../services/userService');
const AppError = require("../utils/appError");
const catchAsync = require("../utils/catchAsync");
const cloudinary = require('../utils/cloudinary');
const ACHIEVEMENTS = require('../enum/achievements');
const { sendAchievementNotification } = require('../utils/socket');

const getProfile = catchAsync(async (req, res, next) => {
    const userId = req.params.id;
    
    const currentUser = await userService.getUserById(userId);

    // const gettingAchivement = await AchievementService.unlockAchievement(userId, ACHIEVEMENTS.FIRST_PROFILE);
    const gettingAchivement = true;
    if (gettingAchivement){
        sendAchievementNotification({
          id: 1,
            name: 'gfdsgfdg',
            description: 'sdjfglsnlkgnksng;',
            reward: 50,
            icon: 'gkgkgnkfgnkfkn'
            // id: gettingAchivement.id,
            // name: gettingAchivement.name,
            // description: gettingAchivement.description,
            // reward: gettingAchivement.reward,
            // icon: gettingAchivement.icon
        });
    }

    return res.json({
        data: currentUser
    });
});

const getStreak = catchAsync(async (req, res, next) => {
    const userId = req.params.id;
    
    const userStreak = await userService.getUserStreak(userId);

    return res.json({
        success: true,
        data: userStreak
    });
});

const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }
    
    const result = await cloudinary.uploader.upload(req.file.path);
    const currentUser = await user.findByPk(req.user.id)
    currentUser.avatarUrl = result.secure_url;
    await currentUser.save();

    res.status(200).json({
      success: true,
      message: 'Uploaded!',
      data: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Error uploading the image',
    });
  };
}

module.exports = { getProfile, getStreak, uploadAvatar };