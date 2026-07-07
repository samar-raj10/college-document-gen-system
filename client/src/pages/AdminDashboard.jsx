import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const roles = ['student', 'hod', 'registrar', 'finance', 'admin'];
const privilegedRoles = ['hod', 'registrar', 'finance', 'admin'];

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [comments, setComments] = useState({});
  const [createForm, setCreateForm] = useState({ name: '', email: '', password: '', role: 'hod', department: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchRequests = async () => {
    const { data } = await api.get('/requests/assigned');
    setRequests(data);
  };

  const fetchUsers = async () => {
    const { data } = await api.get('/admin/users');
    setUsers(data);
  };

  const refresh = async () => {
    await Promise.all([fetchRequests(), fetchUsers()]);
  };

  useEffect(() => {
    refresh();
  }, []);

  const updateStatus = async (id, status) => {
    await api.patch(`/requests/${id}/status`, { status, comments: comments[id] || '' });
    fetchRequests();
  };

  const createUser = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      await api.post('/admin/users', createForm);
      setCreateForm({ name: '', email: '', password: '', role: 'hod', department: '' });
      setMessage('Privileged account created successfully.');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account');
    }
  };

  const changeRole = async (id, role) => {
    setError('');
    setMessage('');
    try {
      await api.patch(`/admin/users/${id}/role`, { role });
      setMessage('User role updated successfully.');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update role');
    }
  };

  return (
    <Layout links={[{ to: '/dashboard', label: 'Admin Dashboard' }]}> 
      <h2 className="text-2xl font-semibold mb-4">Admin Dashboard</h2>
      {message && <p className="bg-green-100 text-green-700 border border-green-200 p-3 rounded mb-4">{message}</p>}
      {error && <p className="bg-red-100 text-red-700 border border-red-200 p-3 rounded mb-4">{error}</p>}

      <section className="bg-white p-4 rounded shadow mb-6">
        <h3 className="text-lg font-semibold mb-3">Create Privileged Account</h3>
        <form onSubmit={createUser} className="grid md:grid-cols-2 gap-3">
          <input className="border rounded p-2" placeholder="Name" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} required />
          <input className="border rounded p-2" placeholder="Email" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} required />
          <input className="border rounded p-2" type="password" placeholder="Temporary password" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} required />
          <select className="border rounded p-2" value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })}>
            {privilegedRoles.map((role) => <option key={role} value={role}>{role}</option>)}
          </select>
          <input className="border rounded p-2 md:col-span-2" placeholder="Department (optional)" value={createForm.department} onChange={(e) => setCreateForm({ ...createForm, department: e.target.value })} />
          <button className="bg-brandOrange text-white px-4 py-2 rounded md:col-span-2">Create Account</button>
        </form>
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
                      {roles.map((role) => <option key={role} value={role}>{role}</option>)}
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
