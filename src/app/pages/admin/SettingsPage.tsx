import { useState } from "react";
import { Lock, User, Check } from "lucide-react";
import { ConfirmDialog } from "../../components/ConfirmDialog";

export function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

  const adminUsername = localStorage.getItem("adminUsername") || "admin";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi password lama (dalam production, cek ke backend)
    if (currentPassword !== "admin123") {
      setMessage({ type: "error", text: "Password lama tidak sesuai" });
      return;
    }

    // Validasi password baru
    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "Password baru minimal 6 karakter" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Konfirmasi password tidak sesuai" });
      return;
    }

    // Show confirmation dialog
    setShowPasswordConfirm(true);
  };

  const handlePasswordChangeConfirm = () => {
    // Dalam production, kirim ke backend untuk update password
    // localStorage.setItem('adminPassword', newPassword);

    setMessage({ type: "success", text: "Password berhasil diubah" });
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswordConfirm(false);

    // Hide message after 3 seconds
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <>
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Pengaturan Admin
          </h1>
          <p className="text-muted-foreground">
            Kelola akun dan keamanan admin
          </p>
        </div>

        {/* Admin Info */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-6">Informasi Admin</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Username</p>
                <p className="font-semibold text-lg">{adminUsername}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold mb-6">Ubah Password</h2>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
                message.type === "success"
                  ? "bg-green-50 border border-green-200 text-green-700"
                  : "bg-red-50 border border-red-200 text-red-600"
              }`}
            >
              {message.type === "success" && <Check className="w-5 h-5" />}
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password Lama *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Masukkan password lama"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Password Baru *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Masukkan password baru"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimal 6 karakter</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Konfirmasi Password Baru *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Ulangi password baru"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30"
            >
              Update Password
            </button>
          </form>
        </div>

        {/* Security Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3">Tips Keamanan</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              Gunakan password yang kuat dengan kombinasi huruf, angka, dan
              simbol
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              Jangan gunakan password yang sama dengan akun lain
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              Ubah password secara berkala untuk keamanan maksimal
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600">•</span>
              Jangan bagikan password kepada siapapun
            </li>
          </ul>
        </div>

        {/* Password Change Confirmation */}
        <ConfirmDialog
          isOpen={showPasswordConfirm}
          title="Konfirmasi Ubah Password"
          message="Apakah Anda yakin ingin mengubah password? Pastikan Anda mengingat password baru."
          confirmText="Ya, Ubah Password"
          cancelText="Batal"
          type="warning"
          onConfirm={handlePasswordChangeConfirm}
          onCancel={() => setShowPasswordConfirm(false)}
        />
      </div>
    </>
  );
}
