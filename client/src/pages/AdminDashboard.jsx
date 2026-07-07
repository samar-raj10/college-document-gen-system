import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const normalizeRoleKey = (name) => name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [comments, setComments] = useState({});
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'hod', department: '' });
  const [newRoleName, setNewRoleName] = useState('');
  const [renameValues, setRenameValues] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const roleOptions = useMemo(() => roles.map((role) => ({ label: role.name, value: role.key })), [roles]);
  const createFormRoleExists = roles.some((role) => role.key === normalizeRoleKey(createForm.role));

  const fetchRequests = async () => {
    const { data } = await api.get('/requests/assigned');
    setRequests(data);
  };

  const fetchUsers = async () => {
    const { data } = await api.get('/admin/users');
    setUsers(data);
  };

  const fetchRoles = async () => {
    const { data } = await api.get('/admin/roles');
    setRoles(data);
    setCreateForm((current) => ({ ...current, role: current.role || data[0]?.key || '' }));
  };

  const refresh = async () => {
    await Promise.all([fetchRequests(), fetchUsers(), fetchRoles()]);
  };

  useEffect(() => {
    refresh();
  }, []);

  const setSuccess = (text) => {
    setError('');
    setMessage(text);
  };

  const setFailure = (text) => {
    setMessage('');
    setError(text);
  };

  const updateStatus = async (id, status) => {
    await api.patch(`/requests/${id}/status`, { status, comments: comments[id] || '' });
    fetchRequests();
  };

  const createRole = async (name) => {
    const roleName = name.trim();
    if (!roleName) {
      setFailure('Role name is required');
      return null;
    }

    try {
      const { data } = await api.post('/admin/roles', { name: roleName });
      await fetchRoles();
      setSuccess(`Role "${data.role.name}" is available.`);
      return data.role;
    } catch (err) {
      setFailure(err.response?.data?.message || 'Failed to create role');
      return null;
    }
  };

  const createRoleFromPanel = async (e) => {
    e.preventDefault();
    const role = await createRole(newRoleName);
    if (role) {
      setNewRoleName('');
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
    setError('');
    setMessage('');

    const role = await ensureCreateFormRole();
    if (!role) return;

    try {
      await api.post('/admin/users', { ...createForm, role: role.key });
      setCreateForm({ name: '', email: '', password: '', role: role.key, department: '' });
      setSuccess('User account created successfully.');
      fetchUsers();
    } catch (err) {
      setFailure(err.response?.data?.message || 'Failed to create account');
    }
  };

  const changeRole = async (id, role) => {
    try {
      await api.patch(`/admin/users/${id}/role`, { role });
      setSuccess('User role updated successfully.');
      fetchUsers();
    } catch (err) {
      setFailure(err.response?.data?.message || 'Failed to update role');
    }
  };

  const renameRole = async (role) => {
    try {
      await api.patch(`/admin/roles/${role.id}`, { name: renameValues[role.id] || role.name });
      setSuccess('Role renamed successfully.');
      fetchRoles();
      fetchUsers();
    } catch (err) {
      setFailure(err.response?.data?.message || 'Failed to rename role');
    }
  };

  const deleteRole = async (role) => {
    try {
      await api.delete(`/admin/roles/${role.id}`);
      setSuccess('Role deleted successfully.');
      fetchRoles();
    } catch (err) {
      setFailure(err.response?.data?.message || 'Failed to delete role');
    }
  };

  return (
    <Layout links={[{ to: '/dashboard', label: 'Admin Dashboard' }]}> 
      <h2 className="text-2xl font-semibold mb-4">Admin Dashboard</h2>
      {message && <p className="bg-green-100 text-green-700 border border-green-200 p-3 rounded mb-4">{message}</p>}
      {error && <p className="bg-red-100 text-red-700 border border-red-200 p-3 rounded mb-4">{error}</p>}

      <datalist id="role-options">
        {roleOptions.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
      </datalist>

      <section className="bg-white p-4 rounded shadow mb-6">
        <h3 className="text-lg font-semibold mb-3">Create User Account</h3>
        <form onSubmit={createUser} className="grid md:grid-cols-2 gap-3">
          <input className="border rounded p-2" placeholder="Name" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} required />
          <input className="border rounded p-2" placeholder="Email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} required />
          <input className="border rounded p-2" type="password" placeholder="Temporary password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} required />
          <div>
            <input className="border rounded p-2 w-full" list="role-options" placeholder="Search or enter a role" value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })} required />
            {!createFormRoleExists && createForm.role && <p className="text-xs text-brandOrange mt-1">This role will be created before assigning it.</p>}
          </div>
          <input className="border rounded p-2 md:col-span-2" placeholder="Department (optional)" value={createForm.department} onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })} />
          <button className="bg-brandOrange text-white px-4 py-2 rounded md:col-span-2">Create Account</button>
        </form>
      </section>

      <section className="bg-white p-4 rounded shadow mb-6">
        <h3 className="text-lg font-semibold mb-3">Roles</h3>
        <form onSubmit={createRoleFromPanel} className="flex gap-2 mb-4">
          <input className="border rounded p-2 flex-1" placeholder="New role name, e.g. Hostel Warden" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} />
          <button className="bg-brandOrange text-white px-4 py-2 rounded">Create Role</button>
        </form>
        <div className="space-y-2">
          {roles.map((role) => (
            <div key={role.id} className="border rounded p-3 flex flex-col md:flex-row md:items-center gap-2">
              <div className="flex-1">
                <p className="font-medium">{role.name}</p>
                <p className="text-xs text-gray-500">Key: {role.key}{role.isSystem ? ' · protected system role' : ''}</p>
              </div>
              <input className="border rounded p-2 md:w-64" disabled={role.isSystem} value={renameValues[role.id] ?? role.name} onChange={(e) => setRenameValues({ ...renameValues, [role.id]: e.target.value })} />
              <button className="bg-gray-700 text-white px-3 py-2 rounded disabled:opacity-50" disabled={role.isSystem} onClick={() => renameRole(role)}>Rename</button>
              <button className="bg-red-600 text-white px-3 py-2 rounded disabled:opacity-50" disabled={role.isSystem} onClick={() => deleteRole(role)}>Delete</button>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white p-4 rounded shadow mb-6">
        <h3 className="text-lg font-semibold mb-3">Manage Users</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Department</th>
                <th className="py-2 pr-3">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b last:border-b-0">
                  <td className="py-2 pr-3">{user.name}</td>
                  <td className="py-2 pr-3">{user.email}</td>
                  <td className="py-2 pr-3">{user.department || 'N/A'}</td>
                  <td className="py-2 pr-3">
                    <select className="border rounded p-1" value={user.role} onChange={(e) => changeRole(user.id, e.target.value)}>
                      {roles.map((role) => <option key={role.key} value={role.key}>{role.name}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="text-lg font-semibold mb-3">All Document Requests</h3>
        <div className="space-y-4">
          {requests.map((request) => (
            <div key={request._id} className="bg-white p-4 rounded shadow border">
              <p className="font-semibold">{request.documentType} - {request.student?.name}</p>
              <p className="text-sm text-gray-600">Assigned Role: {request.assignedToRole}</p>
              <p className="text-sm text-gray-600">Department: {request.student?.department || 'N/A'}</p>
              <p className="text-sm text-gray-600">Details: {request.details}</p>
              <p className="text-sm text-gray-600 mb-2">Status: {request.status}</p>
              <textarea
                className="border rounded p-2 w-full mb-2"
                rows="2"
                placeholder="Add comments"
                value={comments[request._id] || ''}
                onChange={(e) => setComments({ ...comments, [request._id]: e.target.value })}
              />
              <div className="space-x-2">
                <button className="bg-brandOrange text-white px-3 py-1 rounded" onClick={() => updateStatus(request._id, 'Approved')}>
                  Approve
                </button>
                <button className="bg-gray-700 text-white px-3 py-1 rounded" onClick={() => updateStatus(request._id, 'Rejected')}>
                  Reject
                </button>
              </div>
            </div>
          ))}
          {!requests.length && <p className="text-gray-500">No document requests found.</p>}
        </div>
      </section>
    </Layout>
  );
};

export default AdminDashboard;
