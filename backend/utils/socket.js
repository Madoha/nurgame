const { Server } = require('socket.io');
const AppError = require('./appError');
let io;

const initializeSocket = async (httpServer) => {
    io = new Server(httpServer, {
        cors: process.env.CLIENT_URL,
        serveClient: false,
    });

    io.on('connection', (socket) => {
        console.log(`user succe connected ${socket.id}`);
        socket.on('disconnect', () => {
            console.log(`user disconnected ${socket.id}`)
        });
    });

    return io;
};

const sendAchievementNotification = (userAchievement) => {
    if (!io) throw new Error('Socket.io not initialized');
    io.emit('achievementUnlocked', userAchievement);
}

module.exports = {
    initializeSocket,
    sendAchievementNotification 
}