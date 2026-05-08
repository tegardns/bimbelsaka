import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabase";

export function LoginAdmin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // useEffect(() => {
  //   const isAuthenticated =
  //     localStorage.getItem("adminAuthenticated") === "true";

  //   if (isAuthenticated) {
  //     navigate("/cms/candidates", { replace: true });
  //   }
  // }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw new Error(error.message);
      if (!data.session)
        throw new Error("Login gagal, session tidak ditemukan.");

      const userId = data.session.user.id;

      const { data: adminData, error: adminError } = await supabase
        .from("admins")
        .select("user_id, role")
        .eq("user_id", userId)
        .maybeSingle();

      if (adminError) throw new Error(adminError.message);

      if (!adminData) {
        await supabase.auth.signOut();
        localStorage.removeItem("adminAuthenticated");
        localStorage.removeItem("adminUsername");
        throw new Error("Akun ini bukan admin.");
      }

      localStorage.setItem("adminAuthenticated", "true");
      localStorage.setItem("adminUsername", data.session.user.email || "admin");

      window.location.replace("/cms/candidates");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Login gagal.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">Login Admin</h1>
        <p className="text-sm text-slate-500 mb-6">
          Masuk untuk mengelola data pendaftaran dan konten website.
        </p>

        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="admin@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-blue-600 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-70"
          >
            {loading ? "Masuk..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
