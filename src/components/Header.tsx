import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import logoSuina from "@/assets/logo-suina.png";

const navItems = [
  {
    label: "Sobre nós",
    href: "/",
    children: [
      { label: "Quem somos", href: "/" },
      { label: "Equipe", href: "/" },
      { label: "Parceiros", href: "/" },
    ],
  },
  {
    label: "Nosso trabalho",
    href: "/nosso-trabalho",
    children: [
      { label: "Educação Ambiental", href: "/nosso-trabalho" },
      { label: "Conservação", href: "/nosso-trabalho" },
    ],
  },
  { label: "Transparência", href: "/transparencia" },
  {
    label: "Publicações",
    href: "/noticias",
    children: [
      { label: "Blog", href: "/noticias" },
      { label: "Notícias", href: "/noticias" },
      { label: "Material Técnico", href: "/material-tecnico" },
      { label: "Editais", href: "/noticias" },
    ],
  },
  {
    label: "Participe",
    href: "/prestacao-de-contas",
    children: [
      { label: "Doe", href: "/prestacao-de-contas" },
      { label: "Voluntariado", href: "/contato" },
    ],
  },
  { label: "Contato", href: "/contato" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto flex items-center justify-between py-3 px-4">
        <Link to="/" className="flex items-center gap-3">
          <img src={logoSuina} alt="Instituto Suinã" className="h-12 w-auto" />
          <span className="font-display text-xl font-bold text-secondary hidden sm:block">Suinã</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-6">
          {navItems.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => item.children && setOpenDropdown(item.label)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <Link to={item.href} className="nav-link flex items-center gap-1">
                {item.label}
                {item.children && <ChevronDown className="w-3 h-3" />}
              </Link>
              {item.children && openDropdown === item.label && (
                <div className="absolute top-full left-0 mt-1 bg-card rounded-lg shadow-lg border border-border py-2 min-w-[180px]">
                  {item.children.map((child) => (
                    <Link
                      key={child.label}
                      to={child.href}
                      className="block px-4 py-2 text-sm font-body text-foreground hover:bg-muted transition-colors"
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Social icons desktop */}
        <div className="hidden lg:flex items-center gap-2">
          {["whatsapp", "facebook", "instagram", "linkedin", "youtube"].map((s) => (
            <a key={s} href="#" className="w-8 h-8 rounded-full border border-foreground/30 flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors text-xs font-body">
              {s[0].toUpperCase()}
            </a>
          ))}
        </div>

        {/* Mobile toggle */}
        <button className="lg:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-6 h-6 text-foreground" /> : <Menu className="w-6 h-6 text-foreground" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-card border-t border-border px-4 py-4">
          {navItems.map((item) => (
            <div key={item.label} className="mb-2">
              <Link
                to={item.href}
                className="block py-2 font-body font-medium text-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
              {item.children && (
                <div className="pl-4">
                  {item.children.map((child) => (
                    <Link
                      key={child.label}
                      to={child.href}
                      className="block py-1 text-sm text-muted-foreground"
                      onClick={() => setMobileOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </header>
  );
};

export default Header;
