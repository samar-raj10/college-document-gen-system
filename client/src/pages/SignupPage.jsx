import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const SignupPage = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
  });
  const [error, setError] = useState("");
  const { signup } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await signup(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="rounded-[2rem] border border-orange-100 bg-white/90 p-8 shadow-soft backdrop-blur">
          <div className="mb-6 text-center">
            <span className="inline-flex items-center rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
              Student Registration
            </span>
            <h1 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
              Signup for access
            </h1>
            <p className="mt-2 text-sm text-gray-500">
              Create a student account to request university documents.
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-3xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={submit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Full Name
              </label>
              <input
                className="w-full rounded-3xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-gray-900 transition focus:border-orange-400 focus:bg-white"
                placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Email
              </label>
              <input
                className="w-full rounded-3xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-gray-900 transition focus:border-orange-400 focus:bg-white"
                placeholder="someone@muj.manipal.edu"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Password
              </label>
              <input
                className="w-full rounded-3xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-gray-900 transition focus:border-orange-400 focus:bg-white"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Department
              </label>
              <input
                className="w-full rounded-3xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-gray-900 transition focus:border-orange-400 focus:bg-white"
                placeholder="Department (optional)"
                value={form.department}
                onChange={(e) =>
                  setForm({ ...form, department: e.target.value })
                }
              />
            </div>
            <p className="text-sm text-gray-500">
              Public registrations are created as Student accounts.
            </p>
            <button className="w-full rounded-3xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-700">
              Signup
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-orange-600 hover:text-orange-700"
            >
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
