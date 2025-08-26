"use client";
import { useEffect, useState, useId } from "react";
import { useRouter } from "next/navigation";

type LoginResp = { token?: string; role?: string; message?: string; error?: string };

export default function LoginPage() {
  const router = useRouter();

  // ✅ Stable IDs for SSR/CSR match
  const emailId = useId();
  const passwordId = useId();
  const roleId = useId();

  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => setMounted(true), []);

  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";
  const LOGIN_URL = `${API}/auth/login`;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    console.log("✅ Login submit:", email, "→", LOGIN_URL);

    try {
      const res = await fetch(LOGIN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      let text = "";
      let data: LoginResp | null = null;
      try {
        text = await res.text();
        data = text ? (JSON.parse(text) as LoginResp) : null;
      } catch {}

      if (!res.ok) {
        const backendMsg = data?.message || data?.error || text || "Login failed";
        setMsg(backendMsg);
        return;
      }

      const token = data?.token;
      const role = String(data?.role || "").toUpperCase();
      if (!token || !role) {
        setMsg("Unexpected server response (missing token/role).");
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("role", role);

      if (role === "ADMIN") router.replace("/admin");
      else if (role === "OWNER") router.replace("/store-owner");
      else router.replace("/stores");
    } catch (err: any) {
      console.error("Login error:", err);
      setMsg(
        err?.message?.includes("fetch") || err?.name === "TypeError"
          ? "Network/CORS error. Backend on :5000?"
          : "Server error while signing in."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow p-6">
        <h1 className="text-2xl font-semibold mb-1 text-center">Sign In</h1>
        <p className="text-sm text-gray-500 mb-6 text-center">
          Choose your role and enter credentials.
        </p>

        {msg && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {msg}
          </div>
        )}

        {/* UI-only dropdown; not sent */}
        <div className="mb-4">
          <label htmlFor={roleId} className="block text-sm font-medium mb-1">
            User Type
          </label>
          <select
            id={roleId}
            className="w-full rounded-xl border border-gray-300 px-3 py-2 bg-white"
          >
            <option>Store Owner</option>
            <option>Admin</option>
            <option>Normal User</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">
            *Dropdown UI only — backend decides by account.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
          noValidate
          suppressHydrationWarning
        >
          <div>
            <label htmlFor={emailId} className="block text-sm font-medium">
              Email
            </label>
            <input
              id={emailId}
              name="email"
              type="email"
              autoComplete="email"
              className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-black/10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div>
            <label htmlFor={passwordId} className="block text-sm font-medium">
              Password
            </label>
            <div className="mt-1 flex items-center rounded-xl border border-gray-300 focus-within:ring-2 focus-within:ring-black/10">
              <input
                id={passwordId}
                name="password"
                type={showPwd ? "text" : "password"}
                autoComplete="current-password"
                className="w-full rounded-xl px-3 py-2 outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
              <button
                type="button"
                className="px-3 py-2 text-sm text-gray-600"
                onClick={() => setShowPwd((s) => !s)}
                aria-label={showPwd ? "Hide password" : "Show password"}
              >
                {showPwd ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-black px-4 py-2 text-white disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
