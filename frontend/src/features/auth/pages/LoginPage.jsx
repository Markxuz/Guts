import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { login } from "../services/authApi";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (payload) => {
      setAuth(payload);
      navigate("/", { replace: true });
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-200 p-4">
      <div className="w-full max-w-md rounded-xl border border-white/10 bg-[#14121a] p-6 shadow-xl">
        <div className="mb-5 flex items-center gap-3">
          <img
            src="/Guts%20Icon.png"
            alt="Guardians Technical School"
            className="h-25 w-25 rounded-xl object-contain"
          />
          <div>
            <h1 className="text-lg font-bold text-[#e8e5e0]">Guardians Technical School</h1>
            <p className="text-xs text-[#c7a24a]">Admin / Staff Login</p>
          </div>
        </div>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            loginMutation.mutate(form);
          }}
        >
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-[#c4c8cd]">Email</span>
            <input
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              className="h-10 w-full rounded-lg border border-white/10 bg-[#1c1a23] px-3 text-sm text-[#e8e5e0] outline-none focus:border-[#c7a24a]"
              type="email"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-[#c4c8cd]">Password</span>
            <input
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              className="h-10 w-full rounded-lg border border-white/10 bg-[#1c1a23] px-3 text-sm text-[#e8e5e0] outline-none focus:border-[#c7a24a]"
              type="password"
              required
            />
          </label>

          {loginMutation.isError ? (
            <p className="text-sm text-red-400">{loginMutation.error.message}</p>
          ) : null}

          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full rounded-lg bg-[#6d1224] py-2 text-sm font-semibold text-white hover:bg-[#92183a] disabled:opacity-60"
          >
            {loginMutation.isPending ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
