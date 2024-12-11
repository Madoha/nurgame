'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("roles", [
      {
        name: "Admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "User",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Tester",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await queryInterface.bulkInsert("courses", [
      {
        title: "Борьба против коррупции",
        description:
          "Курс состоит из модулей, которые охватывают теоретические и практические вопросы противодействия коррупции в бизнесе...",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    await queryInterface.bulkInsert("courseModules", [
      {
        title: "Введение",
        courseId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "БАЗОВЫЕ ЗНАНИЯ О КОРРУПЦИИ И АНТИКОРРУПЦИИ",
        description:
          "Что такое коррупция? Типы, формы, теории происхождения, вред, который она причиняет обществу, бизнесу, государству.",
        courseId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "Антикоррупционный комплаенс для квазигосударственного сектора и частного бизнеса от А до Я",
        courseId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        title: "Ответственность за коррупцию",
        courseId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("roles", null, {});
    await queryInterface.bulkDelete("courses", null, {});
    await queryInterface.bulkDelete("courseModules", null, {});
  },
};

