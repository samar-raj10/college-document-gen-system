import { useEffect, useMemo, useState } from 'react';
import Layout from '../components/Layout';
import api from '../services/api';

const studentLinks = [
  { to: '/dashboard', label: 'Student Dashboard' },
  { to: '/student/document-vault', label: 'Document Vault' }
];

const formatDate = (dateValue) => {
  if (!dateValue) return 'N/A';
  return new Date(dateValue).toLocaleDateString();
};

const DocumentVaultPage = () => {
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState('');
  const [sortOrder, setSortOrder] = useState('newest');
  const [error, setError] = useState('');

  const fetchDocuments = async () => {
    try {
      const { data } = await api.get('/requests/vault');
      setDocuments(data);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load document vault');
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return documents
      .filter((document) => !query || document.documentType.toLowerCase().includes(query) || document._id.toLowerCase().includes(query))
      .sort((first, second) => {
        const firstDate = new Date(first.reviewedAt || first.updatedAt || first.createdAt).getTime();
        const secondDate = new Date(second.reviewedAt || second.updatedAt || second.createdAt).getTime();
        return sortOrder === 'newest' ? secondDate - firstDate : firstDate - secondDate;
      });
  }, [documents, search, sortOrder]);

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
    <Layout links={studentLinks}>
      <h2 className="text-2xl font-semibold mb-4">Document Vault</h2>
      <p className="text-gray-600 mb-6">Access all approved and generated documents from one place.</p>

      <div className="bg-white p-4 rounded shadow mb-6 grid md:grid-cols-2 gap-3">
        <input
          className="border rounded p-2"
          placeholder="Search by document type or request ID"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className="border rounded p-2" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      {error && <p className="bg-red-100 text-red-700 border border-red-200 p-3 rounded mb-4">{error}</p>}

      <div className="space-y-4">
        {filteredDocuments.map((document) => (
          <div key={document._id} className="bg-white p-4 rounded shadow border flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="font-semibold text-lg">{document.documentType}</p>
              <p className="text-sm text-gray-600">Status: Approved / Issued</p>
              <p className="text-sm text-gray-600">Approved Date: {formatDate(document.reviewedAt || document.updatedAt)}</p>
              <p className="text-sm text-gray-600">Request ID: {document._id}</p>
              {document.reviewedBy?.name && <p className="text-sm text-gray-600">Approved By: {document.reviewedBy.name}</p>}
              {document.comments && <p className="text-sm text-gray-600">Comment: {document.comments}</p>}
            </div>
            <button onClick={() => downloadPdf(document._id)} className="bg-brandOrange text-white px-4 py-2 rounded">
              Download PDF
            </button>
          </div>
        ))}
        {!filteredDocuments.length && !error && <p className="text-gray-500">No approved documents are available in your vault yet.</p>}
      </div>
    </Layout>
  );
};

export default DocumentVaultPage;
