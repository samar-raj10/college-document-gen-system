import { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const AuthorityDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [comments, setComments] = useState({});

  const fetchRequests = async () => {
    const { data } = await api.get('/requests/assigned');
    setRequests(data);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (id, status) => {
    await api.patch(`/requests/${id}/status`, { status, comments: comments[id] || '' });
    fetchRequests();
  };

  return (
    <Layout links={[{ to: '/dashboard', label: 'Authority Dashboard' }]}>
      <h2 className="text-2xl font-semibold mb-4">Authority Dashboard</h2>
      <div className="space-y-4">
        {requests.map((request) => (
          <div key={request._id} className="bg-white p-4 rounded shadow border">
            <p className="font-semibold">{request.documentType} - {request.student?.name}</p>
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
        {!requests.length && <p className="text-gray-500">No assigned requests.</p>}
      </div>
    </Layout>
  );
};

export default AuthorityDashboard;
