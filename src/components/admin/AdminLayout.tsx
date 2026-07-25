import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Newspaper,
  BookOpen,
  ClipboardList,
  Shield,
  Mail,
  Send,
  LogOut,
  Menu,
  X,
  Megaphone,
  Users,
  UserPlus,
  PanelsTopLeft,
  BriefcaseBusiness,
  MessageSquare,
  Info,
  Handshake,
  Layers,
  HeartHandshake,
  ChevronDown,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import logoSuina from "@/assets/logo-suina.png";

type NavLink = {
  label: string;
  icon: LucideIcon;
  path: string;
  // exact = only active on an exact pathname match (used for parent routes
  // whose prefix would otherwise also match a child route)
  exact?: boolean;
};

type NavGroup = {
  label: string;
  icon: LucideIcon;
  children: NavLink[];
};

// Standalone link shown at the very top, above every group.
const dashboardItem: NavLink = { label: "Dashboard", icon: LayoutDashboard, path: "/admin", exact: true };

// Groups mirror the public site navigation (see src/components/Header.tsx):
// "Sobre nós", "Nosso trabalho", "Transparência" -> Páginas do site
// "Nossas publicações" -> Publicações
// "Participe" / "Contato" -> Participe
// E-mail Marketing stays its own group to preserve the E-mail Marketing -> Públicos submenu.
const navGroups: NavGroup[] = [
  {
    label: "Páginas do site",
    icon: PanelsTopLeft,
    children: [
      { label: "Sobre nós", icon: Info, path: "/admin/pages" },
      { label: "Nosso Trabalho", icon: BriefcaseBusiness, path: "/admin/work-projects" },
      { label: "Transparência", icon: Shield, path: "/admin/transparency" },
      { label: "Parceiros", icon: Handshake, path: "/admin/partners" },
    ],
  },
  {
    label: "Publicações",
    icon: BookOpen,
    children: [
      { label: "Blog", icon: FileText, path: "/admin/blog" },
      { label: "Notícias", icon: Newspaper, path: "/admin/noticias" },
      { label: "Material Técnico", icon: BookOpen, path: "/admin/material-tecnico" },
      { label: "Editais", icon: ClipboardList, path: "/admin/editais" },
      { label: "Informativos", icon: Megaphone, path: "/admin/informativos" },
    ],
  },
  {
    label: "Participe",
    icon: HeartHandshake,
    children: [
      { label: "Newsletter", icon: Mail, path: "/admin/newsletter" },
      { label: "Contatos", icon: MessageSquare, path: "/admin/contatos" },
    ],
  },
  {
    label: "E-mail Marketing",
    icon: Send,
    children: [
      { label: "Campanhas", icon: Layers, path: "/admin/email-marketing", exact: true },
      { label: "Públicos", icon: Users, path: "/admin/email-marketing/publicos" },
    ],
  },
];

const SUPER_ADMIN_EMAIL = "comunicacao@institutosuina.org";

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Explicit user toggles per group. When a group is not present here we fall
  // back to auto-expanding whenever it contains the current route.
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login");
  };

  const isActive = (path: string, exact = false) => {
    if (path === "/admin" || exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const groupHasActiveChild = (group: NavGroup) =>
    group.children.some((child) => isActive(child.path, child.exact));

  const isGroupOpen = (group: NavGroup) =>
    openGroups[group.label] ?? groupHasActiveChild(group);

  const toggleGroup = (group: NavGroup) =>
    setOpenGroups((prev) => ({
      ...prev,
      [group.label]: !(prev[group.label] ?? groupHasActiveChild(group)),
    }));

  const linkClasses = (active: boolean) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      active
        ? "bg-emerald-50 text-emerald-700"
        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
    }`;

  const renderChildLink = (child: NavLink) => {
    const active = isActive(child.path, child.exact);
    return (
      <Link
        key={child.path}
        to={child.path}
        onClick={() => setSidebarOpen(false)}
        aria-current={active ? "page" : undefined}
        className={`flex items-center gap-2.5 pl-4 pr-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          active
            ? "bg-emerald-50 text-emerald-700"
            : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
        }`}
      >
        <child.icon className="h-4 w-4 shrink-0" />
        <span className="truncate">{child.label}</span>
      </Link>
    );
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
          {/* Dashboard — standalone, always at the top */}
          <Link
            to={dashboardItem.path}
            onClick={() => setSidebarOpen(false)}
            aria-current={isActive(dashboardItem.path, dashboardItem.exact) ? "page" : undefined}
            className={linkClasses(isActive(dashboardItem.path, dashboardItem.exact))}
          >
            <dashboardItem.icon className="h-5 w-5 shrink-0" />
            <span>{dashboardItem.label}</span>
          </Link>

          {/* Collapsible groups mirroring the public site sections */}
          {navGroups.map((group) => {
            const open = isGroupOpen(group);
            const hasActive = groupHasActiveChild(group);
            return (
              <div key={group.label} className="pt-1">
                <button
                  type="button"
                  onClick={() => toggleGroup(group)}
                  aria-expanded={open}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                    hasActive
                      ? "text-emerald-700"
                      : "text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900"
                  }`}
                >
                  <group.icon className="h-5 w-5 shrink-0" />
                  <span className="flex-1 text-left">{group.label}</span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
                  />
                </button>
                {open && (
                  <div className="mt-1 ml-3 pl-2 border-l border-zinc-200 space-y-1">
                    {group.children.map(renderChildLink)}
                  </div>
                )}
              </div>
            );
          })}

          {/* Usuários — super admin only, standalone */}
          {user?.email === SUPER_ADMIN_EMAIL && (
            <Link
              to="/admin/users"
              onClick={() => setSidebarOpen(false)}
              aria-current={isActive("/admin/users") ? "page" : undefined}
              className={`mt-1 ${linkClasses(isActive("/admin/users"))}`}
            >
              <UserPlus className="h-5 w-5 shrink-0" />
              <span>Usuários</span>
            </Link>
          )}
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
