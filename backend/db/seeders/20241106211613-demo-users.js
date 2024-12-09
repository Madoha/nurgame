'use strict';

const bcrypt = require('bcrypt');
const ROLE_IDS = require('../../config/roles');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('users', [
      {
        firstName: 'admin',
        lastName: 'admin',
        username: 'admin',
        password: bcrypt.hashSync('admin', 10),
        email: 'admin@example.com',
        roleId: ROLE_IDS.ADMIN,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('users', null, {})
  }
};
