const dayjs = require('dayjs');
const streak = require("../db/models/streak");
const catchAsync = require("../utils/catchAsync");

const streakCheck = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    let userStreak = await streak.findOne({where: { userId }});
    if (!userStreak){
        userStreak = await streak.create({
            userId,
            streakCount: 1,
            lastVisit: new Date(),
        })
    } else {
        const lastVisit = dayjs(userStreak.lastVisit);
        const today = dayjs();

        if (lastVisit.isSame(today, 'day')) {
            // skip, already was today
        } else if (lastVisit.add(1, 'day').isSame(today, 'day')) {
            userStreak.streakCount += 1;
            userStreak.lastVisit = new Date();
            await userStreak.save();
        } else {
            userStreak.streakCount = 1;
            userStreak.lastVisit = new Date();
            await userStreak.save();
        }
    }

    req.userStreak = userStreak.streakCount;

    next();
});

module.exports = streakCheck;