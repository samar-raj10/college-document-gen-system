import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await login(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={submit}
        className="bg-white shadow p-8 rounded w-full max-w-md space-y-4"
      >
        <h2 className="text-2xl font-semibold">Login</h2>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <input
          className="w-full border rounded p-2"
          placeholder="Email (someone@muj.manipal.edu)"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <div className="relative">
          <input
            className="w-full border rounded p-2 pr-12"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-3 flex items-center text-gray-500"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.98 8.223A10.477 10.477 0 001.5 12c1.1 3.6 4 6.6 7.5 8.2a12.2 12.2 0 002.5.8 12.2 12.2 0 002.5-.8c3.5-1.6 6.4-4.6 7.5-8.2-.8-2.6-2.4-4.9-4.5-6.4M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-5 w-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.999 3l18 18M9.88 9.88A3 3 0 0012 15a3 3 0 002.12-.88M6.6 6.6A10.48 10.48 0 001.5 12c1.1 3.6 4 6.6 7.5 8.2a12.2 12.2 0 002.5.8 12.2 12.2 0 002.5-.8c1.3-.6 2.5-1.4 3.6-2.4M10.2 4.2A10.7 10.7 0 0112 4c3.5 0 6.4 2.9 7.5 6.8-.5 1.6-1.2 3-2.2 4.2"
                />
              </svg>
            )}
          </button>
        </div>
        <button className="w-full bg-brandOrange text-white p-2 rounded">
          Login
        </button>
        <p className="text-sm">
          Don't have an account yet?{" "}
          <Link to="/signup" className="text-brandOrange">
            Signup
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginPage;
