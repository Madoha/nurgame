'use strict';
const {
  Model, DataTypes
} = require('sequelize');
const sequelize = require('../../config/database');
const course = require('./course');
const lesson = require('./lesson');
const test = require('./test');

const courseModule = sequelize.define('courseModules', {
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
  courseId: {
    type: DataTypes.INTEGER,
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
  modelName: 'courseModule',
  freezeTableName: true
})

courseModule.associate = function(models){
  courseModule.belongsTo(course, { foreignKey: 'courseId' }),
  courseModule.hasMany(lesson, { foreignKey: 'courseModuleId' }),
  courseModule.hasMany(test, { foreignKey: 'courseModuleId' })
};

module.exports = courseModule;