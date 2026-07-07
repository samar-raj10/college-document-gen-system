const express = require('express');
const {
  listUsers,
  createUser,
  updateUserRole,
  listRoles,
  createRole,
  renameRole,
  deleteRole
} = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect, authorizeRoles('admin'));
router.get('/roles', listRoles);
router.post('/roles', createRole);
router.patch('/roles/:id', renameRole);
router.delete('/roles/:id', deleteRole);
router.get('/users', listUsers);
router.post('/users', createUser);
router.patch('/users/:id/role', updateUserRole);

module.exports = router;
