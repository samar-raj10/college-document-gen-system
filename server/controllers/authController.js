const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

const signup = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'student',
      department
    });

    return res.status(201).json({
      token: signToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    return res.json({
      token: signToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const me = async (req, res) => {
  return res.json({ user: req.user });
};

module.exports = { signup, login, me };
