const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Role = require("../models/Role");
const DocumentRequest = require("../models/DocumentRequest");
const {
  ensureRole,
  formatRole,
  normalizeRoleKey,
  renameRoleAndAssignments,
  roleExists,
} = require("../utils/roleService");

const formatUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  department: user.department,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const listUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.json(users.map(formatUser));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;
    const roleKey = normalizeRoleKey(role || "");

    if (!(await roleExists(roleKey))) {
      return res
        .status(400)
        .json({
          message: "Role does not exist. Create the role before assigning it.",
        });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: roleKey,
      department,
    });

    return res.status(201).json({ user: formatUser(user) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const roleKey = normalizeRoleKey(req.body.role || "");

    if (!(await roleExists(roleKey))) {
      return res.status(400).json({ message: "Role does not exist" });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.role = roleKey;
    await user.save();

    return res.json({ user: formatUser(user) });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const listRoles = async (req, res) => {
  try {
    const roles = await Role.find().sort({ name: 1 });
    return res.json(roles.map(formatRole));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const createRole = async (req, res) => {
  try {
    const { name } = req.body;
    const role = await ensureRole(name || "");
    return res.status(201).json({ role: formatRole(role) });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const renameRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    if (role.isSystem) {
      return res
        .status(400)
        .json({ message: "System roles cannot be renamed" });
    }

    const updatedRole = await renameRoleAndAssignments(
      role,
      req.body.name || "",
    );
    return res.json({ role: formatRole(updatedRole) });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const deleteRole = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ message: "Role not found" });
    }

    if (role.isSystem) {
      return res
        .status(400)
        .json({ message: "System roles cannot be deleted" });
    }

    const assignedUsers = await User.countDocuments({ role: role.key });
    if (assignedUsers > 0) {
      return res
        .status(400)
        .json({ message: "Role is assigned to users and cannot be deleted" });
    }

    const assignedRequests = await DocumentRequest.countDocuments({
      $or: [{ assignedToRole: role.key }, { "workflow.role": role.key }],
    });
    if (assignedRequests > 0) {
      return res
        .status(400)
        .json({
          message:
            "Role is assigned to document requests and cannot be deleted",
        });
    }

    await role.deleteOne();
    return res.json({ message: "Role deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  listUsers,
  createUser,
  updateUserRole,
  listRoles,
  createRole,
  renameRole,
  deleteRole,
};
