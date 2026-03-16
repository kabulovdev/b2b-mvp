import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../api/client";
import { useAuth } from "../auth/AuthProvider";
import type { User } from "../auth/types";

type LoginResponse = {
  token: string;
  user: User;
};

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(response.token);
      navigate(response.user.role === "buyer" ? "/buyer" : "/supplier");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-lg border border-slate-800 bg-slate-900 p-6 shadow">
      <h1 className="mb-2 text-xl font-semibold">Login</h1>
      <p className="mb-6 text-sm text-slate-400">Sign in to manage RFQs or offers.</p>
      {error ? <div className="mb-4 rounded bg-red-500/10 p-3 text-sm text-red-300">{error}</div> : null}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm text-slate-300">Email</label>
          <input
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-sm text-slate-300">Password</label>
          <input
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
        <button
          className="w-full rounded bg-emerald-500 px-3 py-2 font-semibold text-slate-900 hover:bg-emerald-400"
          disabled={loading}
          type="submit"
        >
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-400">
        New here? <Link className="text-emerald-400 hover:text-emerald-300" to="/register">Create an account</Link>.
      </p>
    </div>
  );
};

export default LoginPage;
