'use strict';
const {
  Model, DataTypes
} = require('sequelize');
const sequelize = require('../../config/database');
const achievement = sequelize.define('achievements', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  achievementKey: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull:true,
  },
  icon: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  reward: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
  },
  type: {
    type: DataTypes.ENUM('global', 'course'),
    allowNull: false,
    defaultValue: 'global',
  },
  courseId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE
  },
  updatedAt: {
    allowNull: false,
    type: DataTypes.DATE
  }
}, {
  freezeTableName: true,
  tableName: 'achievements'
});

module.exports = achievement;