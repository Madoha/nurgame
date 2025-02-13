const user = require("../../db/models/user");
const AppError = require("../../utils/appError");
const tokenService = require("./tokenService");
const role = require('../../db/models/role');
const UserTokenDto = require('../../dto/user/userTokenDto');
const { isGoogleProvider } = require('../../utils/authUtils'); 
const { sendPasswordResetEmail, sendResetSuccessEmail } = require('../mailtrap/mailService');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

class AuthService {
    async registration(dto){
        const { email, username, firstName, lastName, password, confirmPassword, roleName } = dto;
        
        if (!email || !password || !confirmPassword || password != confirmPassword) throw new AppError('Something wrong this email or password');

        const candidate = await user.findOne({where: {email: email}});

        if (candidate) {
            throw new AppError('This email is alredy registered', 400)
        }

        const roleUp = await this.getRoleByName(roleName ? roleName : 'Tester');

        const newUser = await user.create({
            username: username,
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: bcrypt.hashSync(password, 10), // password already hashed because of orm
            roleId: roleUp.id,
        });

        const userDto = new UserTokenDto(newUser);
        userDto.role = roleUp.name;

        const tokens = await this.generateAndSaveTokens(userDto);

        return {
            ...tokens,
            user: userDto
        }
    };

    async login(email, password){
        if (!email || !password) throw new AppError('Email or Password not provided', 400);

        const result = await user.findOne({where: {email: email}});
        if (!result || result.googleId) throw new AppError('Email not found or already registered', 400);

        if (!(await bcrypt.compare(password, result.password))) throw new AppError('Incorrect email or password', 401);


        const userDto = new UserTokenDto(result);
        userDto.role = (await role.findByPk(result.roleId)).name;
        const tokens = await this.generateAndSaveTokens(userDto);

        return {...tokens, user: userDto};
    }
    
    async googleCallback(tokens, oauth2Client){
        oauth2Client.setCredentials(tokens)

        const { data } = await oauth2Client.request({
            url: 'https://www.googleapis.com/oauth2/v1/userinfo',
        })
        const googleEmail = data.email;
        const roleUp = await this.getRoleByName(process.env.GOOGLE_AUTH_USER_ROLE)

        let currentUser = await user.findOne({where: {email: googleEmail }});
        if (!currentUser){
            currentUser = await user.create({
                googleId: data.id.toString(),
                email: googleEmail,
                roleId: roleUp.id,
                avatarUrl: data.picture,
            });
        }

        if (currentUser && !currentUser.googleId) throw new AppError('You already registered with password', 400);

        // const tokensToCookie = await tokenService.generateTokens({ id: currentUser.id, email: currentUser.email, role: roleUp.name });
        // await tokenService.saveToken(currentUser.id, tokensToCookie.refreshToken);
        const userDto = new UserTokenDto(currentUser);
        userDto.role = roleUp.name;
        const tokensToCookie = await this.generateAndSaveTokens(userDto);

        return tokensToCookie;
    }

    async logout(refreshToken){
        const token = await tokenService.removeToken(refreshToken);
        return token;
    }

    async refresh(refreshToken){
        if (!refreshToken) throw new AppError('Unauthorized access', 401);

        const userData = await tokenService.validateRefreshToken(refreshToken);
        const tokenFromDb = await tokenService.findToken(refreshToken);

        if (!userData || !tokenFromDb){
            throw new AppError('Unauthorized', 401); // ???????????  1:01:50
        }

        // should we put 0 to exist cookies ???

        const currentUser = await user.findByPk(userData.id);
        const userDto = new UserTokenDto(currentUser);
        const tokens = await this.generateAndSaveTokens(userDto);
        return {...tokens, user: userDto};
    }

    async forgotPassword(email){
        const currentUser = await user.findOne({ where: { email }});
        if(!currentUser) throw new AppError('User not found', 400);
        if(await isGoogleProvider(currentUser)) throw new AppError('You dont have access to this function', 400); 

        const resetToken = crypto.randomBytes(20).toString('hex');
        const resetTokenExpiresAt = new Date(Date.now() + 3600000); // 1 hour

        currentUser.resetPasswordToken = resetToken;
        currentUser.resetPasswordExpiresAt = resetTokenExpiresAt;

        await currentUser.save();

        await sendPasswordResetEmail(currentUser.email, `${process.env.CLIENT_URL}/api/auth/reset-password/${resetToken}`);
    }

    async resetPassword(token, newPassword, confirmNewPassword){
        const currentUser = await user.findOne({ where: { resetPasswordToken: token }});
        if (!currentUser) throw new AppError('Invalid or expired reset token', 400);
        if(await isGoogleProvider(currentUser)) throw new AppError('You dont have access to this function', 400); 

        if (currentUser.resetPasswordExpiresAt < Date.now()) throw new AppError('Token expired', 400);

        if (newPassword != confirmNewPassword) throw new AppError('Password does not match', 401);

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        currentUser.password = hashedPassword;
        currentUser.resetPasswordToken = null;
        currentUser.resetPasswordExpiresAt = null;
        await currentUser.save();

        await sendResetSuccessEmail(currentUser.email);
    }

    async changePassword(userId, oldPassword, newPassword, confirmNewPassword){
        const currentUser = await user.findByPk(userId);
        if(await isGoogleProvider(currentUser)) throw new AppError('You dont have access to this function', 400); 
        const isPasswordCorrect = await bcrypt.compare(oldPassword, currentUser.password);
        console.log('fsfs', isPasswordCorrect)
        console.log(newPassword, confirmNewPassword)
        if (!isPasswordCorrect || newPassword != confirmNewPassword) throw new AppError('Password in correct or does not match', 401);

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        currentUser.password = hashedPassword;
        await currentUser.save();
    }

    async getRoleByName(roleName) {
        const roleUp = await role.findOne({ where: { name: roleName } });
        if (!roleUp) throw new AppError('Role does not exist', 400);
        return roleUp;
    }
    
    async generateAndSaveTokens(userDto) {
        const tokens = await tokenService.generateTokens({ ...userDto });
        await tokenService.saveToken(userDto.id, tokens.refreshToken);
        return tokens;
    }
    
}

module.exports = new AuthService();