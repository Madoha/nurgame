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
const certificate = require('../db/models/certificate');
const userCourseProgress = require('../db/models/usercourseprogress');
const courseModule = require("../db/models/coursemodule");
const achievement = require("../db/models/achievement");
const userAchievement = require("../db/models/userachievement");

const getProfile = catchAsync(async (req, res, next) => {
    const userId = req.params.id;
    
    const currentUser = await userService.getUserById(userId);

    const gettingAchivement = await AchievementService.unlockAchievement(userId, ACHIEVEMENTS.FIRST_PROFILE);
    // const gettingAchivement = true;
    if (gettingAchivement){
        sendAchievementNotification({
            id: gettingAchivement.id,
            name: gettingAchivement.name,
            description: gettingAchivement.description,
            reward: gettingAchivement.reward,
            icon: gettingAchivement.icon
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

const getCoins = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
    
    const userCoins = await userService.getUserCoins(userId);

    return res.json({
        success: true,
        data: userCoins
    });
});

const getAchivement = catchAsync(async (req, res, next) => {
  const userId = req.params.id;

  const userAchievements = await userService.getUserAchievements(userId);

  return res.json({
    success: true,
    data: userAchievements
});
})

const getUserProgress = catchAsync(async (req, res, next) => {
  const userId = req.params.id;
  const isCourseCompleted = await certificate.findOne({where : { userId }})
  let isCourseCompletedBool;
  let isCourseCompletedProgress;
  if (isCourseCompleted) {
    isCourseCompletedBool = 1;
    isCourseCompletedProgress = 100;
  } else {
    isCourseCompletedBool = 0;
    isCourseCompletedProgress = 0;
  }

  const completedModules = await userCourseProgress.findOne({ where: { userId }});
  const totalModules = await courseModule.findAll({where: { courseId: 3 }});
  const progress = (completedModules.completedModules.length / totalModules.length) * 100;
  const progressPercentage = Math.round(progress * 100) / 100;

  const allAchievements = await achievement.findAll();
  const userAchievements = await userAchievement.findAll({where: { userId }})
  const progressAch = (userAchievements.length / allAchievements.length) * 100;

  const progressPercentageAch = Math.round(progressAch * 100) / 100;

  return res.json({
    isCourseCompleted: isCourseCompletedBool, 
    isCourseCompletedProgress, 
    userCompletedModules: completedModules.completedModules.length, 
    userCompletedModulesProgress: progressPercentage, 
    userAchievements: userAchievements.length,
    userAchievementsProgress: progressPercentageAch
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

module.exports = { getProfile, getStreak, uploadAvatar, getCoins, getAchivement, getUserProgress };