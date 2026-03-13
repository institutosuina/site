import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import logoSuina from "@/assets/logo-suina-full.png";

const navItems = [
  {
    label: "Sobre nós",
    href: "/",
    children: [
      { label: "Quem somos", href: "/#quem-somos" },
      { label: "Linha do tempo", href: "/#timeline" },
      { label: "Equipe", href: "/#equipe" },
      { label: "Apoiadores e parceiros", href: "/#parceiros" },
    ],
  },
  {
    label: "Nosso trabalho",
    href: "/nosso-trabalho",
  },
  { label: "Transparência", href: "/transparencia" },
  {
    label: "Nossas publicações",
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
    href: "/contato",
    children: [
      { label: "Como apoiar", href: "/contato" },
      { label: "Cadastre-se para receber nossa newsletter", href: "/contato" },
      { label: "Suinã nas Redes Sociais", href: "/contato" },
    ],
  },
  { label: "Contato", href: "/contato" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Background: White, Dark Brown: #3e2723
  const navBg = "#ffffff";
  const darkBrown = "#3e2723";
  const beigeButton = "#e6d5bc"; // Keeping the beige for the 'Doar' button to contrast

  return (
    <header className="sticky top-0 z-40 border-b border-black/5" style={{ backgroundColor: navBg }}>
      <div className="container mx-auto flex items-center justify-between py-4 px-6">
        <Link to="/" className="flex items-center gap-3">
          <img src={logoSuina} alt="Instituto Suinã" className="h-12 w-auto" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-8">
          {navItems.map((item) => (
            <div
              key={item.label}
              className="relative"
              onMouseEnter={() => item.children && setOpenDropdown(item.label)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              <Link 
                to={item.href} 
                className="text-[17px] font-display font-bold transition-colors flex items-center gap-1 group"
                style={{ color: darkBrown }}
              >
                {item.label}
                {item.children && <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === item.label ? 'rotate-180' : ''}`} />}
              </Link>
              
              {item.children && openDropdown === item.label && (
                <div 
                  className="absolute top-full left-[-10px] mt-2 rounded-[20px] shadow-xl border border-black/5 py-3 min-w-[240px] animate-in slide-in-from-top-2 duration-200"
                  style={{ backgroundColor: navBg }}
                >
                  {item.children.map((child) => (
                    <Link
                      key={child.label}
                      to={child.href}
                      className="block px-6 py-2.5 text-[15px] font-display font-bold hover:bg-black/5 transition-colors first:rounded-t-[20px] last:rounded-b-[20px]"
                      style={{ color: darkBrown }}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* Action Button Desktop */}
        <div className="hidden lg:block">
          <Link 
            to="/contato"
            className="px-10 py-4 font-display font-bold text-[18px] rounded-[20px] shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
            style={{ backgroundColor: beigeButton, color: darkBrown, border: "1px solid rgba(62, 39, 35, 0.1)" }}
          >
            Doar
          </Link>
        </div>

        {/* Mobile toggle */}
        <button className="lg:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)} style={{ color: darkBrown }}>
          {mobileOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-black/5 px-6 py-6 space-y-4" style={{ backgroundColor: navBg }}>
          {navItems.map((item) => (
            <div key={item.label} className="space-y-2">
              <Link
                to={item.href}
                className="block text-xl font-display font-bold"
                style={{ color: darkBrown }}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
              {item.children && (
                <div className="pl-4 space-y-2">
                  {item.children.map((child) => (
                    <Link
                      key={child.label}
                      to={child.href}
                      className="block py-1 text-lg font-display font-bold opacity-80"
                      style={{ color: darkBrown }}
                      onClick={() => setMobileOpen(false)}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div className="pt-4 border-t border-black/10">
            <Link 
              to="/contato"
              className="block w-full py-4 text-center font-display font-bold text-xl rounded-[20px]"
              style={{ backgroundColor: beigeButton, color: darkBrown, border: "1px solid rgba(62, 39, 35, 0.2)" }}
              onClick={() => setMobileOpen(false)}
            >
              Doar
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
