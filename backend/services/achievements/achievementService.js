const achievement = require('../../db/models/achievement');
const userAchievement = require('../../db/models/userachievement');
const AppError = require('../../utils/appError');
const io = require('../../utils/socket');
const user = require('../../db/models/user');

class AchievementService {
    static async unlockAchievement(userId, achievementKey) { // можно как статик, и не надо будет инстанс создавать
        const isAchievement = await achievement.findOne({where: { achievementKey }}); 
        if (!isAchievement) throw new AppError('achievement not found', 404);

        const currentUser = await user.findByPk(userId);
        if (!currentUser) throw new AppError('user not found', 404);

        const alreadyUnlocked = await userAchievement.findOne({
            where: {
                userId,
                achievementId: isAchievement.id
            },
        });

        if(alreadyUnlocked) return false; // { message: 'Achievement already unlocked', isAchievement };

        currentUser.coins += isAchievement.reward;
        await currentUser.save();

        await userAchievement.create({
            userId,
            achievementId: isAchievement.id
        });

        return isAchievement;
    }
}

module.exports = AchievementService;

// const unlockAchievement = async (userId, achievementKey) => {
//     try {
//         const isAchievement = await achievement.findOne({where: { achievementKey }});

//         if (!isAchievement) throw new AppError('Достижения не существует', 400);

//         const existingAchievement = await userAchievement.findOne({where: { userId, achievementKey }});

//         if (existingAchievement) throw new AppError('already has', 400);

//         await userAchievement.create({
//             userId,
//             achievementId: achievement.id,
//         });

//         const socket = io.getIO();
//         socket.to(userId).emit('newAchievement', {
//             message: `Поздравляем! Вы получили достижение: ${achievementName}`,
//             achievementKey,
//         })

//         return true;
//     } catch (error) {
//         throw new AppError(`Ошибка при добавлении ачивки: ${error.message}`, 400);
//     }
// };

// module.exports = {
//     unlockAchievement,
// }