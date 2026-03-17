import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Shield,
  Mail,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import logoSuina from "@/assets/logo-suina.png";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { label: "Conteúdo", icon: FileText, path: "/admin/content" },
  { label: "Transparência", icon: Shield, path: "/admin/transparency" },
  { label: "Newsletter", icon: Mail, path: "/admin/newsletter" },
];

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  const isActive = (path: string) => {
    if (path === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-scope min-h-screen bg-zinc-50 font-['Inter',sans-serif] flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-zinc-200 flex flex-col transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center gap-3 px-5 border-b border-zinc-200">
          <img src={logoSuina} alt="Instituto Suinã" className="h-8 w-8 object-contain" />
          <span className="font-bold text-xl text-zinc-800 tracking-tight">Instituto Suinã</span>
          <button
            className="lg:hidden ml-auto text-zinc-500 hover:text-zinc-800"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="border-t border-zinc-200 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-sm">
              {user?.email?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="!text-xs font-medium text-zinc-800 truncate !leading-tight">
                {user?.email || "Admin"}
              </p>
              <p className="!text-[11px] text-zinc-400 !leading-tight">Administrador</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-zinc-500 hover:text-red-600 hover:bg-red-50 !text-sm"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center px-4 lg:px-8 gap-4 shrink-0">
          <button
            className="lg:hidden text-zinc-600 hover:text-zinc-900"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="font-bold text-xl text-zinc-800 hidden sm:block">Instituto Suinã</h1>
          <div className="ml-auto flex items-center gap-3">
            <Link
              to="/"
              className="text-sm text-zinc-500 hover:text-emerald-600 transition-colors"
            >
              Ver site →
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
