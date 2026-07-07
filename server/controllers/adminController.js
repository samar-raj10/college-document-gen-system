const bcrypt = require('bcryptjs');
const User = require('../models/User');

const MANAGEABLE_ROLES = ['student', 'hod', 'registrar', 'finance', 'admin'];
const PRIVILEGED_ROLES = ['hod', 'registrar', 'finance', 'admin'];

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  department: user.department,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

const listUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.json(users.map(formatUser));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createPrivilegedUser = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    if (!PRIVILEGED_ROLES.includes(role)) {
      return res.status(400).json({ message: 'Admin-created users must have a privileged role' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      department
    });

    return res.status(201).json({ user: formatUser(user) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!MANAGEABLE_ROLES.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = role;
    await user.save();

    return res.json({ user: formatUser(user) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = { listUsers, createPrivilegedUser, updateUserRole };
