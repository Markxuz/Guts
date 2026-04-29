import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { login } from "../services/authApi";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: (payload) => {
      setAuth(payload);
      navigate("/", { replace: true });
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-200 p-4">
      <div className="w-full max-w-lg rounded-xl border border-white/10 bg-[#14121a] p-5 shadow-xl sm:max-w-md sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <img
            src="/Guts%20Icon.png"
            alt="Guardians Technical School"
            className="h-24 w-24 shrink-0 rounded-xl object-contain sm:h-25 sm:w-25"
          />
          <div>
            <h1 className="text-base font-bold text-[#e8e5e0] sm:text-lg">Guardians Technical School</h1>
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
            <div className="relative">
              <input
                value={form.password}
                onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
                className="h-10 w-full rounded-lg border border-white/10 bg-[#1c1a23] px-3 text-sm text-[#e8e5e0] outline-none focus:border-[#c7a24a]"
                type={showPassword ? "text" : "password"}
                required
              />
              <button type="button" onClick={() => setShowPassword((s) => !s)} className="absolute right-3 top-2 text-slate-400">
                {showPassword ? <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3-11-8 1.02-2.7 2.79-4.86 4.95-6.18"/><path d="M1 1l22 22"/></svg> : <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>}
              </button>
            </div>
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
