import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import api from "../services/api";

const AuthorityDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [comments, setComments] = useState({});

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

  useEffect(() => {
    fetchRequests();
  }, []);

  const updateStatus = async (id, status) => {
    await api.patch(`/requests/${id}/status`, {
      status,
      comments: comments[id] || "",
    });
    fetchRequests();
  };

  return (
    <Layout links={[{ to: "/dashboard", label: "Authority Dashboard" }]}>
      <div className="space-y-6">
        <section className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-soft">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-orange-700">
                Authority workspace
              </p>
              <h1 className="mt-2 text-3xl font-bold text-gray-900">
                Review assigned document requests
              </h1>
            </div>
            <span className="inline-flex items-center rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700">
              {requests.length} assigned request
              {requests.length === 1 ? "" : "s"}
            </span>
          </div>
        </section>

        <section className="grid gap-4">
          {requests.map((request) => {
            const terminal = isTerminalStatus(request.status);

            return (
              <div
                key={request._id}
                className="rounded-[2rem] border border-orange-100 bg-orange-50 p-6 shadow-soft"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
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

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-3xl border border-orange-100 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-orange-700">
                      Assigned role
                    </p>
                    <p className="mt-2 text-sm text-gray-800">
                      {request.assignedToRole || "Unassigned"}
                    </p>
                  </div>
                  <div className="rounded-3xl border border-orange-100 bg-white p-4">
                    <p className="text-xs uppercase tracking-[0.24em] text-orange-700">
                      Requested on
                    </p>
                    <p className="mt-2 text-sm text-gray-800">
                      {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-5 rounded-3xl border border-orange-100 bg-white p-4">
                  <p className="text-sm text-gray-600">Details</p>
                  <p className="mt-2 text-sm text-gray-900">
                    {request.details}
                  </p>
                </div>

                <div className="mt-4">
                  <textarea
                    className="min-h-[120px] w-full rounded-3xl border border-orange-200 bg-white px-4 py-3 text-sm text-gray-900 transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                    rows="3"
                    placeholder="Add comments"
                    value={comments[request._id] || ""}
                    onChange={(e) =>
                      setComments({
                        ...comments,
                        [request._id]: e.target.value,
                      })
                    }
                  />
                </div>

                {terminal ? (
                  <p className="mt-4 text-sm text-gray-500">
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
            <div className="rounded-[2rem] border border-orange-100 bg-white p-6 shadow-soft">
              <p className="text-gray-600">
                No assigned requests available at the moment.
              </p>
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
};

export default AuthorityDashboard;
