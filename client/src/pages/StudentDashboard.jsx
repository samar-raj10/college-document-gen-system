import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";

const documentTypes = ["Bonafide", "LOR", "NOC", "No Dues", "Fee Structure"];
const studentLinks = [
  { to: "/dashboard", label: "Student Dashboard" },
  { to: "/student/document-vault", label: "Document Vault" },
];

const StudentDashboard = () => {
  const [form, setForm] = useState({ documentType: "Bonafide", details: "" });
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState("");

  const fetchRequests = async () => {
    const { data } = await api.get("/requests/my");
    setRequests(data.filter((request) => request.status !== "Approved"));
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/requests", form);
      setForm({ ...form, details: "" });
      setError("");
      fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit request");
    }
  };

  return (
    <Layout links={studentLinks}>
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          <section className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-700">
                  Quick request
                </p>
                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  Submit a new document request
                </h2>
              </div>
              <span className="inline-flex rounded-3xl bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700">
                Fast approval
              </span>
            </div>

            {error && (
              <p className="mb-4 rounded-3xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <form onSubmit={submit} className="grid gap-4">
              <label className="block text-sm font-semibold text-gray-700">
                Document Type
              </label>
              <select
                className="w-full rounded-3xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-gray-900 transition focus:border-orange-400 focus:bg-white"
                value={form.documentType}
                onChange={(e) =>
                  setForm({ ...form, documentType: e.target.value })
                }
              >
                {documentTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>

              <label className="block text-sm font-semibold text-gray-700">
                Request Details
              </label>
              <textarea
                className="min-h-[140px] w-full rounded-3xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-gray-900 transition focus:border-orange-400 focus:bg-white"
                rows="5"
                placeholder="Describe the document request and any special instructions"
                value={form.details}
                onChange={(e) => setForm({ ...form, details: e.target.value })}
                required
              />

              <button className="w-full rounded-3xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-700">
                Submit Request
              </button>
            </form>
          </section>

          <section className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-soft">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-700">
                  Tracking
                </p>
                <h2 className="mt-2 text-3xl font-bold text-gray-900">
                  Active requests
                </h2>
              </div>
              <span className="text-sm text-gray-500">
                {requests.length} pending
              </span>
            </div>

            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request._id}
                  className="rounded-3xl border border-orange-100 bg-orange-50 p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {request.documentType}
                      </p>
                      <p className="mt-2 text-sm text-gray-600">
                        Status:{" "}
                        <span className="font-semibold text-orange-700">
                          {request.status}
                        </span>
                      </p>
                      {request.comments && (
                        <p className="mt-2 text-sm text-gray-600">
                          Comment: {request.comments}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {!requests.length && (
                <p className="text-gray-500">
                  No active requests. Approved documents are available in your
                  Document Vault.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default StudentDashboard;
