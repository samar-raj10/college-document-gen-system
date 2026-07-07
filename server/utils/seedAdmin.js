const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { ensureRole } = require('./roleService');

const seedInitialAdmin = async () => {
  const { ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_DEPARTMENT } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    return;
  }

  await ensureRole('Admin', { key: 'admin', isSystem: true });

  const existingAdmin = await User.findOne({ role: 'admin' });
  if (existingAdmin) {
    return;
  }

  const existingUser = await User.findOne({ email: ADMIN_EMAIL });
  if (existingUser) {
    existingUser.role = 'admin';
    existingUser.name = existingUser.name || ADMIN_NAME || 'System Admin';
    existingUser.department = existingUser.department || ADMIN_DEPARTMENT;
    await existingUser.save();
    console.log(`Initial admin promoted: ${ADMIN_EMAIL}`);
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
  await User.create({
    name: ADMIN_NAME || 'System Admin',
    email: ADMIN_EMAIL,
    password: hashedPassword,
    role: 'admin',
    department: ADMIN_DEPARTMENT
  });
  console.log(`Initial admin created: ${ADMIN_EMAIL}`);
};

module.exports = { seedInitialAdmin };
