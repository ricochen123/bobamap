import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { formatApiError } from "../utils/format";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password_confirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.password_confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await register(form);
      navigate("/profile");
    } catch (err) {
      setError(formatApiError(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="card w-full max-w-md p-8">
        <h1 className="font-display text-2xl font-bold">Join BobaMap</h1>
        <p className="mt-1 text-gray-500">Save favorites and discover new spots</p>

        {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <label className="mt-6 block">
          <span className="text-sm font-medium">Username</span>
          <input className="input-field mt-1" value={form.username} onChange={set("username")} required />
        </label>
        <label className="mt-4 block">
          <span className="text-sm font-medium">Email</span>
          <input type="email" className="input-field mt-1" value={form.email} onChange={set("email")} />
        </label>
        <label className="mt-4 block">
          <span className="text-sm font-medium">Password</span>
          <input
            type="password"
            className="input-field mt-1"
            value={form.password}
            onChange={set("password")}
            required
            autoComplete="new-password"
          />
        </label>
        <label className="mt-4 block">
          <span className="text-sm font-medium">Confirm password</span>
          <input
            type="password"
            className="input-field mt-1"
            value={form.password_confirm}
            onChange={set("password_confirm")}
            required
          />
        </label>

        <button type="submit" className="btn-primary mt-6 w-full" disabled={loading}>
          {loading ? "Creating account…" : "Sign up"}
        </button>

        <p className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-boba-600 hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
