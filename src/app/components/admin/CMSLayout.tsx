import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import {
  Users,
  FileText,
  UserPlus,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { ConfirmDialog } from "../ConfirmDialog";
import logoSaka from "../../../imports/bim.png";
import { supabase } from "../../../lib/supabase";

export function CMSLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // mobile
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // desktop
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = async () => {
    try {
      await supabase.auth.signOut();

      localStorage.removeItem("adminAuthenticated");
      localStorage.removeItem("adminUsername");

      setShowLogoutConfirm(false);
      navigate("/loginadmin", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const menuItems = [
    { path: "/cms/candidates", icon: UserPlus, label: "Data Candidate" },
    { path: "/cms/students", icon: Users, label: "Data Pendaftar" },
    { path: "/cms/articles", icon: FileText, label: "Data Artikel" },
    { path: "/cms/settings", icon: Settings, label: "Edit Admin" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-gradient-to-r from-primary to-primary/90 border-b border-primary-dark fixed top-0 left-0 right-0 z-50 shadow-lg">
        <div className="flex items-center justify-between px-4 h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-lg text-white"
            >
              {isSidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>

            <img src={logoSaka} alt="Bimbel Saka" className="h-10 w-auto" />
            {/* <span className="font-bold text-lg text-white hidden sm:block">
              CMS Admin
            </span> */}
          </div>

          <button
            onClick={handleLogoutClick}
            className="flex items-center gap-2 px-4 py-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed top-16 left-0 bottom-0 bg-white border-r border-gray-200 transition-all duration-300 z-40
        ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }
        ${isSidebarCollapsed ? "lg:w-20" : "lg:w-64"} w-64`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div
            className={`flex items-center ${
              isSidebarCollapsed ? "justify-center" : "justify-between"
            } gap-3 p-4 border-b border-gray-200`}
          >
            {!isSidebarCollapsed && (
              <div className="flex items-center gap-3">
                {/* <img src={logoSaka} alt="Bimbel Saka" className="h-8 w-auto" /> */}
                <div>
                  <h2 className="text-sm font-bold text-gray-900">
                    Hai Melsaa 👋
                  </h2>
                  <p className="text-xs text-gray-500">Kelola data bimbel</p>
                </div>
              </div>
            )}

            <button
              onClick={() => setIsSidebarCollapsed((prev) => !prev)}
              className="hidden lg:flex items-center justify-center h-9 w-9 rounded-lg hover:bg-gray-100 text-gray-600"
              title={isSidebarCollapsed ? "Buka sidebar" : "Tutup sidebar"}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Menu */}
          <nav className="p-4 space-y-2 flex-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  title={isSidebarCollapsed ? item.label : undefined}
                  className={`flex items-center gap-3 rounded-xl transition-all ${
                    isSidebarCollapsed
                      ? "justify-center px-3 py-3"
                      : "px-4 py-3"
                  } ${
                    active
                      ? "bg-primary !text-white shadow-md"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />

                  {!isSidebarCollapsed && (
                    <span className="font-medium whitespace-nowrap">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={`pt-16 transition-all duration-300 ${
          isSidebarCollapsed ? "lg:pl-20" : "lg:pl-64"
        }`}
      >
        <div className="p-6">
          <Outlet />
        </div>
      </main>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Logout Confirmation */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        title="Konfirmasi Logout"
        message="Apakah Anda yakin ingin keluar dari sistem CMS?"
        confirmText="Ya, Logout"
        cancelText="Batal"
        type="warning"
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}
