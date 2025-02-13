const UserResponseDto = require("../dto/user/userResponseDto");
const user = require('../db/models/user');
const role = require('../db/models/role');
const AppError = require('../utils/appError');
const streak = require("../db/models/streak");
const userAchievement = require("../db/models/userachievement");
const achievement = require('../db/models/achievement');

class UserService {
    async getUserById(userId){
        if (!userId) throw new AppError('User ID cannot be undefined', 400);

        const userDetail = await user.findOne({where: {id: userId}});

        if (!userDetail) throw new AppError('Invalid user id', 400);

        const userResponseDto = new UserResponseDto(userDetail);
        userResponseDto.role = (await role.findByPk(userDetail.roleId)).name;

        return userResponseDto;
    }

    async getUserStreak(userId){
        const currentUser = await user.findByPk(userId);

        if (!currentUser) {
            throw new AppError('course not found', 404)
        }

        const userStreak = await streak.findOne({where: { userId }})
        if (!userStreak) {
            throw new AppError('user streak not found', 404)
        }
        
        return userStreak.streakCount;
    }

    async getUserCoins(userId) {
        const currentUser = await user.findByPk(userId);

        if (!currentUser) {
            throw new AppError('course not found', 404)
        }
        
        return currentUser.coins;
    }

    async getUserAchievements(userId) {
        const achGot = await userAchievement.findAll({where: {userId}});

        if (achGot.length <= 0) {
            throw new AppError('у вас нету достижения', 400)
        }
    
        const achievementIds = achGot.map(ua => ua.achievementId);

        const achievements = await achievement.findAll({
            where: { id: achievementIds },
            attributes: ['id', 'name', 'description', 'icon']
        });

        const result = achievements.map(achievement => {
            const userAchievement = achGot.find(ua => ua.achievementId === achievement.id);
            return {
                id: achievement.id,
                name: achievement.name,
                description: achievement.description,
                icon: achievement.icon,
                obtainedAt: userAchievement.createdAt // Дата получения из userAchievement
            };
        });
    
        return result;
    }
}

module.exports = new UserService();