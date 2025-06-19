'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const hashedPassword = await bcrypt.hash('password123', 12);
    
    await queryInterface.bulkInsert('users', [
      {
        username: 'testuser',
        email: 'test@example.com',
        password_hash: hashedPassword,
        name: 'Test User',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        username: 'admin',
        email: 'admin@example.com',
        password_hash: hashedPassword,
        name: 'Admin User',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('users', null, {});
  }
};
