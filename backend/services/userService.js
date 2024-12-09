const UserResponseDto = require("../dto/user/userResponseDto");
const user = require('../db/models/user');
const role = require('../db/models/role');
const AppError = require('../utils/appError');
const streak = require("../db/models/streak");

class UserService {
    async getUserById(userId){
        if (!userId) throw new AppError('User ID cannot be undefined', 400);

        const userDetail = await user.findByPk(userId);

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
        
        return userStreak;
    }
}

module.exports = new UserService();