'use strict';
const courseModule = require('../models/coursemodule');
const certificate = require('../models/certificate');
const {
  Model, DataTypes
} = require('sequelize');
const sequelize = require('../../config/database');
const user = require('./user');
const course = sequelize.define('courses', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  title: {
    type: DataTypes.STRING
  },
  description: {
    type: DataTypes.TEXT
  },
  avatarUrl: {
    type: DataTypes.STRING,
    allowNull: true,
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
  modelName: 'courses'
});

course.associate = function(models){
  course.belongsToMany(user, { through: userCourseProgress, foreignKey: 'courseId' }),
  course.hasMany(courseModule, { foreignKey: 'courseId' }),
  course.hasMany(certificate, { foreignKey: 'courseId' })
};

module.exports = course;