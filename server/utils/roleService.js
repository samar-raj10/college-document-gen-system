const Role = require("../models/Role");
const User = require("../models/User");
const DocumentRequest = require("../models/DocumentRequest");

const SYSTEM_ROLES = [
  { name: "Student", key: "student" },
  { name: "HOD", key: "hod" },
  { name: "Registrar", key: "registrar" },
  { name: "Faculty", key: "faculty" },
  { name: "Chief Librarian", key: "chief-librarian" },
  { name: "Chief Warden", key: "chief-warden" },
  { name: "Finance", key: "finance" },
  { name: "Admin", key: "admin" },
];

const normalizeRoleKey = (name) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const formatRole = (role) => ({
  id: role._id,
  name: role.name,
  key: role.key,
  isSystem: role.isSystem,
  createdAt: role.createdAt,
  updatedAt: role.updatedAt,
});

const ensureRole = async (name, options = {}) => {
  const key = options.key || normalizeRoleKey(name);
  if (!key) {
    throw new Error("Role name is required");
  }

  const role = await Role.findOneAndUpdate(
    { key },
    {
      $setOnInsert: {
        name: name.trim(),
        key,
        isSystem: Boolean(options.isSystem),
      },
    },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  );

  if (options.isSystem && !role.isSystem) {
    role.isSystem = true;
    await role.save();
  }

  return role;
};

const seedSystemRoles = async () => {
  await Promise.all(
    SYSTEM_ROLES.map((role) =>
      ensureRole(role.name, { key: role.key, isSystem: true }),
    ),
  );
};

const roleExists = async (key) => Boolean(await Role.exists({ key }));

const renameRoleAndAssignments = async (role, nextName) => {
  const nextKey = normalizeRoleKey(nextName);
  if (!nextKey) {
    throw new Error("Role name is required");
  }

  const duplicate = await Role.findOne({
    key: nextKey,
    _id: { $ne: role._id },
  });
  if (duplicate) {
    throw new Error("Role already exists");
  }

  const previousKey = role.key;
  role.name = nextName.trim();
  role.key = nextKey;
  await role.save();

  await User.updateMany({ role: previousKey }, { role: nextKey });
  await DocumentRequest.updateMany(
    { assignedToRole: previousKey },
    { assignedToRole: nextKey },
  );
  // update any workflow stages that referenced the previous role key
  await DocumentRequest.updateMany(
    { "workflow.role": previousKey },
    { $set: { "workflow.$[elem].role": nextKey } },
    { arrayFilters: [{ "elem.role": previousKey }] },
  );

  return role;
};

module.exports = {
  SYSTEM_ROLES,
  normalizeRoleKey,
  formatRole,
  ensureRole,
  seedSystemRoles,
  roleExists,
  renameRoleAndAssignments,
};
