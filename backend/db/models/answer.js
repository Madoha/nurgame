'use strict';
const {
  Model, DataTypes
} = require('sequelize');
const sequelize = require('../../config/database');
const question = require('./question');

const answer = sequelize.define('answers', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  text: {
    type: DataTypes.TEXT
  },
  isCorrect: {
    type: DataTypes.BOOLEAN
  },
  questionId: {
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
  modelName: 'answers'
});

answer.associate = (models) => {
  answer.belongsTo(question, { foreignKey: 'questionId' })
};

module.exports = answer;