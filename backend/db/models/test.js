'use strict';
const {
  Model, DataTypes
} = require('sequelize');
const question = require('../models/question');
const sequelize = require('../../config/database');
const courseModule = require('../models/coursemodule');

const test = sequelize.define('tests', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  type: {
    type: DataTypes.ENUM('mcq', 'open', 'interactive')
  },
  courseModuleId: {
    type: DataTypes.INTEGER
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
  modelName: 'tests'
});

test.associate = (models) => {
  test.belongsTo(courseModule, { foreignKey: 'courseModuleId' }),
  test.hasMany(question, { foreignKey: 'testId' })
};

module.exports = test;