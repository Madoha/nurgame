'use strict';
const { Model, Sequelize, DataTypes } = require('sequelize');
const AppError = require("../../utils/appError");
const bcrypt = require('bcrypt');
const sequelize = require('../../config/database');
const role = require('./role');
const token = require('./token');
const streak = require('./streak');

const user = sequelize.define('users', {
  id: {
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
    type: DataTypes.INTEGER
  },
  googleId: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: true,
    // validate: {
    //   notNull: {
    //     msg: 'username can not be null'
    //   },
    //   notEmpty: {
    //     msg: 'username can not be empty'
    //   }
    // }
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: true,
    // validate: {
    //   notNull: {
    //     msg: 'firstName can not be null'
    //   },
    //   notEmpty: {
    //     msg: 'firstName can not be empty'
    //   }
    // }
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: true,
    // validate: {
    //   notNull: {
    //     msg: 'lastName can not be null'
    //   },
    //   notEmpty: {
    //     msg: 'lastName can not be empty'
    //   }
    // }
  },
  coins: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: true,
    // validate: {
    //   notNull: {
    //     msg: 'email cannot be null'
    //   },
    //   notEmpty: {
    //     msg: 'email cannot be empty',
    //   },
    //   isEmail: {
    //     msg: 'Invalid email id'
    //   },
    // },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: true,
    // validate: {
    //   notNull: {
    //     msg: 'password cannot be null'
    //   },
    //   notEmpty: {
    //     msg: 'password cannot be empty',
    //   },
    // },
  },
  // confirmPassword: {
  //   type: DataTypes.VIRTUAL,
  //   set(value) {
  //     if (this.password.length < 7){
  //       throw new AppError('Password length must be grater than 7', 400)
  //     }
  //     if (value == this.password) {
  //       const hashPassword = bcrypt.hashSync(value, 10);
  //       this.setDataValue('password', hashPassword);
  //     } else {
  //       throw new AppError("Password and confirm password must match", 400);
  //     }
  //   },
  // },
  avatarUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  roleId: {
    type: DataTypes.INTEGER
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
    type: DataTypes.DATE,
  },
  resetPasswordToken: {
    type: DataTypes.STRING,
  },
  resetPasswordExpiresAt: {
    type: DataTypes.DATE,
  },
}, {
  paranoid: true,
  freezeTableName: true,
  modelName: 'users'
});

user.associate = (models) => {
  user.belongsTo(models.role, { foreignKey: 'roleId' }),
  user.hasOne(streak, { foreignKey: 'userId' }),
  user.hasOne(models.token, { foreignKey: 'userId' })
};

module.exports = user;