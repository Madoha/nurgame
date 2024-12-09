'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('achievements', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      achievementKey: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull:true,
      },
      icon: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      reward: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      type: {
        type: Sequelize.ENUM('global', 'course'),
        allowNull: false,
        defaultValue: 'global',
      },
      courseId: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('achievements');
  }
};