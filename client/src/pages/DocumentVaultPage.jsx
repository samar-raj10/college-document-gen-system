import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";

const studentLinks = [
  { to: "/dashboard", label: "Student Dashboard" },
  { to: "/student/document-vault", label: "Document Vault" },
];

const formatDate = (dateValue) => {
  if (!dateValue) return "N/A";
  return new Date(dateValue).toLocaleDateString();
};

const DocumentVaultPage = () => {
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [error, setError] = useState("");

  const fetchDocuments = async () => {
    try {
      const { data } = await api.get("/requests/vault");
      setDocuments(data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load document vault");
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const filteredDocuments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return documents
      .filter(
        (document) =>
          !query ||
          document.documentType.toLowerCase().includes(query) ||
          document._id.toLowerCase().includes(query),
      )
      .sort((first, second) => {
        const firstDate = new Date(
          first.reviewedAt || first.updatedAt || first.createdAt,
        ).getTime();
        const secondDate = new Date(
          second.reviewedAt || second.updatedAt || second.createdAt,
        ).getTime();
        return sortOrder === "newest"
          ? secondDate - firstDate
          : firstDate - secondDate;
      });
  }, [documents, search, sortOrder]);

  const downloadPdf = async (id) => {
    const response = await api.get(`/requests/${id}/pdf`, {
      responseType: "blob",
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `document-${id}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <Layout links={studentLinks}>
      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-soft">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-700">
                  Document Vault
                </p>
                <h1 className="mt-2 text-3xl font-bold text-gray-900">
                  Approved documents
                </h1>
              </div>
              <span className="rounded-3xl bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700">
                Secure storage
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                className="w-full rounded-3xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-gray-900 transition focus:border-orange-400 focus:bg-white"
                placeholder="Search by document type or request ID"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="w-full rounded-3xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-gray-900 transition focus:border-orange-400 focus:bg-white"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </div>
          </section>

          {error && (
            <p className="rounded-3xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="space-y-4">
            {filteredDocuments.map((document) => (
              <div
                key={document._id}
                className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-soft lg:flex lg:items-center lg:justify-between lg:gap-6"
              >
                <div>
                  <p className="text-xl font-semibold text-gray-900">
                    {document.documentType}
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <p className="text-sm text-gray-600">
                      Status:{" "}
                      <span className="font-semibold text-orange-700">
                        Approved
                      </span>
                    </p>
                    <p className="text-sm text-gray-600">
                      Approved Date:{" "}
                      {formatDate(document.reviewedAt || document.updatedAt)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Request ID: {document._id}
                    </p>
                    {document.reviewedBy?.name && (
                      <p className="text-sm text-gray-600">
                        Approved By: {document.reviewedBy.name}
                      </p>
                    )}
                  </div>
                  {document.comments && (
                    <p className="mt-3 text-sm text-gray-600">
                      Comment: {document.comments}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => downloadPdf(document._id)}
                  className="mt-6 inline-flex rounded-3xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 lg:mt-0"
                >
                  Download PDF
                </button>
              </div>
            ))}
            {!filteredDocuments.length && !error && (
              <p className="text-gray-500">
                No approved documents are available in your vault yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DocumentVaultPage;
