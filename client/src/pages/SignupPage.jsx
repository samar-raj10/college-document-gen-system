import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const roles = ['student', 'hod', 'registrar', 'finance', 'admin'];

const SignupPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', department: '' });
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await signup(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={submit} className="bg-white shadow p-8 rounded w-full max-w-md space-y-3">
        <h2 className="text-2xl font-semibold">Signup</h2>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <input className="w-full border rounded p-2" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="w-full border rounded p-2" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input className="w-full border rounded p-2" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <select className="w-full border rounded p-2" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
          {roles.map((role) => <option key={role} value={role}>{role}</option>)}
        </select>
        <input className="w-full border rounded p-2" placeholder="Department (optional)" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
        <button className="w-full bg-brandOrange text-white p-2 rounded">Signup</button>
        <p className="text-sm">Already have account? <Link to="/login" className="text-brandOrange">Login</Link></p>
      </form>
    </div>
  );
};

export default SignupPage;
