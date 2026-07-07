const express = require('express');
const { listUsers, createPrivilegedUser, updateUserRole } = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, authorizeRoles('admin'));
router.get('/users', listUsers);
router.post('/users', createPrivilegedUser);
router.patch('/users/:id/role', updateUserRole);

module.exports = router;
