import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../api/client";
import { useAuth } from "../auth/AuthProvider";
import type { Role, User } from "../auth/types";

type RegisterResponse = {
  token: string;
  user: User;
};

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { setToken } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("buyer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await apiFetch<RegisterResponse>("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password, role }),
      });
      setToken(response.token);
      navigate(response.user.role === "buyer" ? "/buyer" : "/supplier");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-lg border border-slate-800 bg-slate-900 p-6 shadow">
      <h1 className="mb-2 text-xl font-semibold">Create account</h1>
      <p className="mb-6 text-sm text-slate-400">Register as a buyer or supplier.</p>
      {error ? <div className="mb-4 rounded bg-red-500/10 p-3 text-sm text-red-300">{error}</div> : null}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="text-sm text-slate-300">Name</label>
          <input
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </div>
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
        <div>
          <label className="text-sm text-slate-300">Role</label>
          <select
            className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100"
            value={role}
            onChange={(event) => setRole(event.target.value as Role)}
          >
            <option value="buyer">Buyer</option>
            <option value="supplier">Supplier</option>
          </select>
        </div>
        <button
          className="w-full rounded bg-emerald-500 px-3 py-2 font-semibold text-slate-900 hover:bg-emerald-400"
          disabled={loading}
          type="submit"
        >
          {loading ? "Creating..." : "Register"}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-400">
        Already have an account? <Link className="text-emerald-400 hover:text-emerald-300" to="/login">Log in</Link>.
      </p>
    </div>
  );
};

export default RegisterPage;
