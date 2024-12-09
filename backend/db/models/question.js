'use strict';
const {
  Model, DataTypes
} = require('sequelize');
const sequelize = require('../../config/database');
const test = require('./test');
const answer = require('./answer');

const question = sequelize.define('questions', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  text: {
    type: DataTypes.TEXT
  },
  testId: {
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
  modelName: 'questions'
});

question.associate = (models) => {
  question.belongsTo(test, { foreignKey: 'testId' }),
  question.hasMany(answer, { foreignKey: 'questionId' })
}

module.exports = question;