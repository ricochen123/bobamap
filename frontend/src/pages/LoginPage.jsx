import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(username, password);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center bg-gradient-to-br from-boba-50 via-white to-taro-400/10 p-4 dark:from-gray-950 dark:via-gray-900">
      <form onSubmit={handleSubmit} className="card w-full max-w-md p-8 animate-fade-in">
        <h1 className="font-display text-2xl font-bold">Welcome back 🧋</h1>
        <p className="mt-1 text-gray-500">Log in to save your favorite boba spots</p>

        {error && (
          <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/30">{error}</p>
        )}

        <label className="mt-6 block">
          <span className="text-sm font-medium">Username</span>
          <input
            className="input-field mt-1"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
        </label>

        <label className="mt-4 block">
          <span className="text-sm font-medium">Password</span>
          <input
            type="password"
            className="input-field mt-1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>

        <button type="submit" className="btn-primary mt-6 w-full" disabled={loading}>
          {loading ? "Logging in…" : "Log in"}
        </button>

        <p className="mt-4 text-center text-sm text-gray-500">
          No account?{" "}
          <Link to="/register" className="font-medium text-boba-600 hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
