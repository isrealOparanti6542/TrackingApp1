const AdminBro = require('admin-bro');
const AdminBroExpress = require('@admin-bro/express');
const AdminBroMongoose = require('@admin-bro/mongoose');
const mongoose = require('mongoose');
const AdminModel = require('../models/AdminModel.js');  // Correct model name
const UserModel = require('../models/UserModel.js');

AdminBro.registerAdapter(AdminBroMongoose);

const adminBro = new AdminBro({
  databases: [mongoose],
  rootPath: '/admin',
  resources: [
    {
      resource: AdminModel,  // Correct model name
      options: {
        parent: {
          name: 'Administration',
          icon: 'fa-user-tie',
        },
      },
    },
    {
      resource: UserModel,
      options: {
        parent: {
          name: 'Customers',
          icon: 'User',
        },
      },
    },
  ],
});

// ... (authentication and router setup)

const ADMIN = {
  email: process.env.ADMIN_EMAIL || 'admin@example.com',
  password: process.env.ADMIN_PASSWORD || 'calipayapp',
};

const router = AdminBroExpress.buildAuthenticatedRouter(adminBro, {
  cookieName: process.env.ADMIN_COOKIE_NAME || 'admin-bro',
  cookiePassword:
    process.env.ADMIN_COOKIE_PASS ||
    'suppersecret-and-long-password-for-a-cookie-in-the-browser',
  authenticate: async (email, password) => {
    if (email === ADMIN.email && password === ADMIN.password) {
      return ADMIN;
    }
    return null;
  },
  resave: false,
  saveUninitialized: true,
});

module.exports = router;
