const tokenService = require("../services/auth/tokenService");
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const user = require('../db/models/user')

const authentication = catchAsync(async (req, res, next) => {
    let emailToken = '';
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        emailToken = req.headers.authorization.split(' ')[1];
    }

    if(!emailToken) return next(new AppError('Please login to get access', 401));

    const tokenDetails = await tokenService.validateAccessToken(emailToken).catch(err => {
        return next(new AppError('Invalid token', 401));
    });

    if (!tokenDetails || !tokenDetails.id) {
        return next(new AppError('Invalid token details', 401));
    }
    
    const freshUser = await user.findOne({where: {id: tokenDetails.id}});

    if (!freshUser) return next(new AppError('User no longer exists', 400));

    req.user = freshUser;
    return next();
});

module.exports = authentication;