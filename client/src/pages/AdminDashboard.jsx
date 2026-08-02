import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";

const normalizeRoleKey = (name) =>
  name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [comments, setComments] = useState({});
  const [createForm, setCreateForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "hod",
    department: "",
  });
  const [newRoleName, setNewRoleName] = useState("");
  const [renameValues, setRenameValues] = useState({});
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const roleOptions = useMemo(
    () => roles.map((role) => ({ label: role.name, value: role.key })),
    [roles],
  );
  const createFormRoleExists = roles.some(
    (role) => role.key === normalizeRoleKey(createForm.role),
  );

  const isTerminalStatus = (status = "") => {
    const normalized = status.toLowerCase();
    return [
      "approved",
      "rejected",
      "completed",
      "done",
      "finalized",
      "closed",
    ].some((term) => normalized === term || normalized.includes(term));
  };

  const fetchRequests = async () => {
    const { data } = await api.get("/requests/assigned");
    setRequests(data);
  };

  const fetchUsers = async () => {
    const { data } = await api.get("/admin/users");
    setUsers(data);
  };

  const fetchRoles = async () => {
    const { data } = await api.get("/admin/roles");
    setRoles(data);
    setCreateForm((current) => ({
      ...current,
      role: current.role || data[0]?.key || "",
    }));
  };

  const refresh = async () => {
    await Promise.all([fetchRequests(), fetchUsers(), fetchRoles()]);
  };

  useEffect(() => {
    refresh();
  }, []);

  const setSuccess = (text) => {
    setError("");
    setMessage(text);
  };

  const setFailure = (text) => {
    setMessage("");
    setError(text);
  };

  const updateStatus = async (id, status) => {
    await api.patch(`/requests/${id}/status`, {
      status,
      comments: comments[id] || "",
    });
    fetchRequests();
  };

  const createRole = async (name) => {
    const roleName = name.trim();
    if (!roleName) {
      setFailure("Role name is required");
      return null;
    }

    try {
      const { data } = await api.post("/admin/roles", { name: roleName });
      await fetchRoles();
      setSuccess(`Role "${data.role.name}" is available.`);
      return data.role;
    } catch (err) {
      setFailure(err.response?.data?.message || "Failed to create role");
      return null;
    }
  };

  const createRoleFromPanel = async (e) => {
    e.preventDefault();
    const role = await createRole(newRoleName);
    if (role) {
      setNewRoleName("");
    }
  };

  const ensureCreateFormRole = async () => {
    const roleKey = normalizeRoleKey(createForm.role);
    const existingRole = roles.find((role) => role.key === roleKey);
    if (existingRole) return existingRole;

    return createRole(createForm.role);
  };

  const createUser = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    const role = await ensureCreateFormRole();
    if (!role) return;

    try {
      await api.post("/admin/users", { ...createForm, role: role.key });
      setCreateForm({
        name: "",
        email: "",
        password: "",
        role: role.key,
        department: "",
      });
      setSuccess("User account created successfully.");
      fetchUsers();
    } catch (err) {
      setFailure(err.response?.data?.message || "Failed to create account");
    }
  };

  const changeRole = async (id, role) => {
    try {
      await api.patch(`/admin/users/${id}/role`, { role });
      setSuccess("User role updated successfully.");
      fetchUsers();
    } catch (err) {
      setFailure(err.response?.data?.message || "Failed to update role");
    }
  };

  const renameRole = async (role) => {
    try {
      await api.patch(`/admin/roles/${role.id}`, {
        name: renameValues[role.id] || role.name,
      });
      setSuccess("Role renamed successfully.");
      fetchRoles();
      fetchUsers();
    } catch (err) {
      setFailure(err.response?.data?.message || "Failed to rename role");
    }
  };

  const deleteRole = async (role) => {
    try {
      await api.delete(`/admin/roles/${role.id}`);
      setSuccess("Role deleted successfully.");
      fetchRoles();
    } catch (err) {
      setFailure(err.response?.data?.message || "Failed to delete role");
    }
  };

  return (
    <Layout links={[{ to: "/dashboard", label: "Admin Dashboard" }]}>
      <div className="space-y-6">
        <section className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-700">
                Admin console
              </p>
              <h1 className="mt-2 text-3xl font-bold text-gray-900">
                Manage roles, users and approvals
              </h1>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-700" />
              Live system overview
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-3xl border border-orange-100 bg-orange-50 p-5">
              <p className="text-sm text-gray-600">Total users</p>
              <p className="mt-3 text-3xl font-bold text-gray-900">
                {users.length}
              </p>
            </div>
            <div className="rounded-3xl border border-orange-100 bg-orange-50 p-5">
              <p className="text-sm text-gray-600">Active roles</p>
              <p className="mt-3 text-3xl font-bold text-gray-900">
                {roles.length}
              </p>
            </div>
            <div className="rounded-3xl border border-orange-100 bg-orange-50 p-5">
              <p className="text-sm text-gray-600">Open requests</p>
              <p className="mt-3 text-3xl font-bold text-gray-900">
                {requests.length}
              </p>
            </div>
          </div>
        </section>

        {(message || error) && (
          <section className="rounded-3xl border border-orange-100 bg-white p-5 shadow-soft">
            {message && (
              <p className="mb-3 rounded-3xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
                {message}
              </p>
            )}
            {error && (
              <p className="rounded-3xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}
          </section>
        )}

        <section className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-soft">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Create user account
              </h2>
              <p className="text-sm text-gray-500">
                Add admins or authorities with custom roles.
              </p>
            </div>
            <span className="rounded-3xl bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700">
              Role-driven access
            </span>
          </div>

          <datalist id="role-options">
            {roleOptions.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </datalist>

          <form onSubmit={createUser} className="grid gap-4 md:grid-cols-2">
            <input
              className="rounded-3xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-gray-900 transition focus:border-orange-400 focus:bg-white"
              placeholder="Name"
              value={createForm.name}
              onChange={(e) =>
                setCreateForm({ ...createForm, name: e.target.value })
              }
              required
            />
            <input
              className="rounded-3xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-gray-900 transition focus:border-orange-400 focus:bg-white"
              placeholder="Email"
              value={createForm.email}
              onChange={(e) =>
                setCreateForm({ ...createForm, email: e.target.value })
              }
              required
            />
            <input
              className="rounded-3xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-gray-900 transition focus:border-orange-400 focus:bg-white"
              type="password"
              placeholder="Temporary password"
              value={createForm.password}
              onChange={(e) =>
                setCreateForm({ ...createForm, password: e.target.value })
              }
              required
            />
            <div>
              <input
                className="w-full rounded-3xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-gray-900 transition focus:border-orange-400 focus:bg-white"
                list="role-options"
                placeholder="Search or enter a role"
                value={createForm.role}
                onChange={(e) =>
                  setCreateForm({ ...createForm, role: e.target.value })
                }
                required
              />
              {!createFormRoleExists && createForm.role && (
                <p className="mt-2 text-xs text-orange-600">
                  This role will be created before assigning it.
                </p>
              )}
            </div>
            <div className="md:col-span-2">
              <input
                className="w-full rounded-3xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-gray-900 transition focus:border-orange-400 focus:bg-white"
                placeholder="Department (optional)"
                value={createForm.department}
                onChange={(e) =>
                  setCreateForm({ ...createForm, department: e.target.value })
                }
              />
            </div>
            <button className="md:col-span-2 rounded-3xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700">
              Create Account
            </button>
          </form>
        </section>

        <section className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-soft">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Roles</h2>
            <div className="flex gap-2">
              <input
                className="rounded-3xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-gray-900 transition focus:border-orange-400 focus:bg-white"
                placeholder="New role name, e.g. Hostel Warden"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
              />
              <button className="rounded-3xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700">
                Create Role
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {roles.map((role) => (
              <div
                key={role.id}
                className="rounded-3xl border border-orange-100 bg-orange-50 p-4 lg:flex lg:items-center lg:gap-4"
              >
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{role.name}</p>
                  <p className="mt-1 text-xs text-gray-600">
                    Key: {role.key}
                    {role.isSystem ? " · protected system role" : ""}
                  </p>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input
                    className="rounded-3xl border border-orange-200 bg-white px-4 py-3 text-sm text-gray-900"
                    disabled={role.isSystem}
                    value={renameValues[role.id] ?? role.name}
                    onChange={(e) =>
                      setRenameValues({
                        ...renameValues,
                        [role.id]: e.target.value,
                      })
                    }
                  />
                  <button
                    className="rounded-3xl bg-gray-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                    disabled={role.isSystem}
                    onClick={() => renameRole(role)}
                  >
                    Rename
                  </button>
                  <button
                    className="rounded-3xl bg-red-600 px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
                    disabled={role.isSystem}
                    onClick={() => deleteRole(role)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-soft">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Manage users
              </h2>
              <p className="text-sm text-gray-500">
                Review user accounts and update roles.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="text-left border-b border-orange-100 text-gray-700">
                  <th className="py-3 pr-3">Name</th>
                  <th className="py-3 pr-3">Email</th>
                  <th className="py-3 pr-3">Department</th>
                  <th className="py-3 pr-3">Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-100">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="py-3 pr-3">{user.name}</td>
                    <td className="py-3 pr-3">{user.email}</td>
                    <td className="py-3 pr-3">{user.department || "N/A"}</td>
                    <td className="py-3 pr-3">
                      <select
                        className="rounded-3xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-gray-900"
                        value={user.role}
                        onChange={(e) => changeRole(user.id, e.target.value)}
                      >
                        {roles.map((role) => (
                          <option key={role.key} value={role.key}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-soft">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                All document requests
              </h2>
              <p className="text-sm text-gray-500">
                Monitor the current workflow and approval status.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {requests.map((request) => {
              const terminal = isTerminalStatus(request.status);

              return (
                <div
                  key={request._id}
                  className="rounded-3xl border border-orange-100 bg-orange-50 p-5"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {request.documentType}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">
                        {request.student?.name} ·{" "}
                        {request.student?.department || "N/A"}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${terminal ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}
                    >
                      {request.status}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <p className="text-sm text-gray-600">
                      Assigned Role: {request.assignedToRole}
                    </p>
                    <p className="text-sm text-gray-600">
                      Requested on:{" "}
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <p className="mt-4 text-sm text-gray-600">
                    Details: {request.details}
                  </p>
                  <textarea
                    className="mt-4 w-full rounded-3xl border border-orange-200 bg-white px-4 py-3 text-sm text-gray-900"
                    rows="2"
                    placeholder="Add comments"
                    value={comments[request._id] || ""}
                    onChange={(e) =>
                      setComments({
                        ...comments,
                        [request._id]: e.target.value,
                      })
                    }
                  />

                  {terminal ? (
                    <p className="mt-3 text-sm text-gray-500">
                      This request has already reached a final status.
                    </p>
                  ) : (
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        className="rounded-3xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
                        onClick={() => updateStatus(request._id, "Approved")}
                      >
                        Approve
                      </button>
                      <button
                        className="rounded-3xl bg-gray-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                        onClick={() => updateStatus(request._id, "Rejected")}
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            {!requests.length && (
              <p className="text-gray-500">No document requests found.</p>
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default AdminDashboard;
