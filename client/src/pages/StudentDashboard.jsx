import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const documentTypes = ['Bonafide', 'LOR', 'NOC', 'No Dues', 'Fee Structure'];

const StudentDashboard = () => {
  const [form, setForm] = useState({ documentType: 'Bonafide', details: '' });
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');

  const fetchRequests = async () => {
    const { data } = await api.get('/requests/my');
    setRequests(data);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/requests', form);
      setForm({ ...form, details: '' });
      setError('');
      fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request');
    }
  };

  const downloadPdf = async (id) => {
    const response = await api.get(`/requests/${id}/pdf`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `document-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <Layout links={[{ to: '/dashboard', label: 'Student Dashboard' }]}>
      <h2 className="text-2xl font-semibold mb-4">Student Dashboard</h2>

      <form onSubmit={submit} className="bg-white p-4 rounded shadow mb-6 space-y-3">
        <h3 className="text-lg font-semibold">Request Document</h3>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <select className="border rounded p-2 w-full" value={form.documentType} onChange={(e) => setForm({ ...form, documentType: e.target.value })}>
          {documentTypes.map((type) => <option key={type} value={type}>{type}</option>)}
        </select>
        <textarea className="border rounded p-2 w-full" rows="4" placeholder="Add request details" value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} required />
        <button className="bg-brandOrange text-white px-4 py-2 rounded">Submit Request</button>
      </form>

      <div className="bg-white p-4 rounded shadow">
        <h3 className="text-lg font-semibold mb-4">My Requests</h3>
        <div className="space-y-3">
          {requests.map((request) => (
            <div key={request._id} className="border rounded p-3 flex justify-between items-center">
              <div>
                <p className="font-medium">{request.documentType}</p>
                <p className="text-sm text-gray-600">Status: {request.status}</p>
                {request.comments && <p className="text-sm text-gray-600">Comment: {request.comments}</p>}
              </div>
              {request.status === 'Approved' && (
                <button onClick={() => downloadPdf(request._id)} className="bg-brandOrange text-white px-3 py-1 rounded">
                  Download PDF
                </button>
              )}
            </div>
          ))}
          {!requests.length && <p className="text-gray-500">No requests submitted yet.</p>}
        </div>
      </div>
    </Layout>
  );
};

export default StudentDashboard;
