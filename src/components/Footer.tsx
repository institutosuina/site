import { Mail, Phone, MapPin, Instagram, Facebook, Youtube } from "lucide-react";
import folhaSvg from "@/assets/folha.svg";

const Footer = () => {
  return (
    <footer className="relative bg-[#3e2723] text-white py-16 overflow-hidden mt-auto">
      {/* Folha Esquerda (Padrão) */}
      <div 
        className="absolute bottom-0 left-0 z-0 h-full w-[40vw] max-w-[250px] bg-left-bottom bg-no-repeat bg-contain opacity-30 md:w-[25vw] md:opacity-100 pointer-events-none"
        style={{ backgroundImage: `url(${folhaSvg})` }}
        aria-hidden="true"
      />

      {/* Folha Direita (Espelhada horizontalmente com -scale-x-100) */}
      <div 
        className="absolute bottom-0 right-0 z-0 h-full w-[40vw] max-w-[300px] bg-left-bottom bg-no-repeat bg-contain opacity-30 md:w-[30vw] md:opacity-100 -scale-x-100 pointer-events-none"
        style={{ backgroundImage: `url(${folhaSvg})` }}
        aria-hidden="true"
      />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
          {/* Logo e Info */}
          <div className="flex flex-col items-center md:items-start">
            <h3 className="font-display text-2xl font-bold mb-6 italic">Instituto Suinã</h3>
            <p className="font-body text-sm font-normal leading-relaxed opacity-80 max-w-xs">
              Conectando pessoas e territórios para restaurar a sociobiodiversidade.
            </p>
          </div>

          {/* Contato */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="font-display text-lg font-bold mb-6 uppercase tracking-wider">Contato</h4>
            <ul className="space-y-4 font-body text-sm font-normal opacity-80">
              <li className="flex items-center gap-3 justify-center md:justify-start">
                <MapPin className="w-4 h-4 shrink-0" />
                <span>Rua Capitão Alberto Aguiar Weisshon, 337 - Centro - Guararema/SP</span>
              </li>
              <li className="flex items-center gap-3 justify-center md:justify-start">
                <Mail className="w-4 h-4 shrink-0" />
                <span>contato@institutosuina.org</span>
              </li>
              <li className="flex items-center gap-3 justify-center md:justify-start">
                <Phone className="w-4 h-4 shrink-0" />
                <span>(12) 3965-0328</span>
              </li>
            </ul>
          </div>

          {/* Redes Sociais */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="font-display text-lg font-bold mb-6 uppercase tracking-wider">Siga-nos</h4>
            <div className="flex gap-6">
              <a href="#" className="hover:opacity-70 transition-opacity">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="hover:opacity-70 transition-opacity">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="hover:opacity-70 transition-opacity">
                <Youtube className="w-6 h-6" />
              </a>
            </div>
            <p className="mt-8 font-body text-xs font-normal opacity-60">
              CNPJ: 21.766.841/0001-84
            </p>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 text-center">
          <p className="font-body text-xs font-normal opacity-60">
            © {new Date().getFullYear()} Instituto Suinã. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
