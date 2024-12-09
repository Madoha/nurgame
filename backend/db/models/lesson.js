'use strict';
const {
  Model, DataTypes
} = require('sequelize');
const sequelize = require('../../config/database');
const courseModule = require('./coursemodule');

const lesson = sequelize.define('lessons', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  title: {
    type: DataTypes.STRING
  },
  content: {
    type: DataTypes.TEXT
  },
  type: {
    type: DataTypes.ENUM('video', 'interactive'),
  },
  videoUrl: {
    type: DataTypes.STRING
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
  modelName: 'lessons'
});

lesson.associate = (models) => {
  lesson.belongsTo(courseModule, { foreignKey: 'courseModuleId' })
};

module.exports = lesson;