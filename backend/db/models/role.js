'use strict';
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../../config/database');
const user = require('./user');

const role = sequelize.define('roles', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: {
        msg: 'name cannot be null'
      },
      notEmpty: {
        msg: 'name cannot be empty',
      },
    },
  },
  createdAt: {
    allowNull: false,
    type: DataTypes.DATE
  },
  updatedAt: {
    allowNull: false,
    type: DataTypes.DATE
  },
  deletedAt: {
    type: DataTypes.DATE
  }
}, {
  paranoid: true,
  freezeTableName: true,
  modelName: 'roles',
});

role.associate = (models) => {
  role.hasMany(models.user, { foreignKey: 'roleId' });
};

module.exports = role;