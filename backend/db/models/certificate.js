'use strict';
const {
  Model, DataTypes
} = require('sequelize');
const sequelize = require('../../config/database');
const user = require('./user');
const course = require('./course');

const certificate = sequelize.define('certificates', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  score: {
    type: DataTypes.FLOAT
  },
  userId: {
    type: DataTypes.INTEGER
  },
  courseId: {
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
  modelName: 'certificates'
});

certificate.associate = (models) => {
  certificate.belongsTo(user, { foreignKey: 'userId' }),
  certificate.belongsTo(course, { foreignKey: 'courseId' })
;}

module.exports = certificate;