import leafDecoration from "@/assets/leaf-decoration.png";

const Footer = () => {
  return (
    <footer className="footer-bg relative overflow-hidden">
      <div className="absolute right-0 top-0 bottom-0 w-64 opacity-20 pointer-events-none">
        <img src={leafDecoration} alt="" className="h-full w-full object-cover" />
      </div>
      <div className="container mx-auto py-12 px-4 text-center relative z-10">
        <p className="font-display text-lg font-semibold mb-4">Suinã Instituto Socioambiental</p>
        <p className="font-body text-sm opacity-80 mb-1">
          Rua Capitão Alberto Aguiar Weisshon, 337 - Centro - Guararema/SP.
        </p>
        <p className="font-body text-sm opacity-80 mb-1">21.766.841/0001-84</p>
        <p className="font-body text-sm opacity-80 mb-1">contato@institutosuina.org</p>
        <p className="font-body text-sm opacity-80 mb-4">(12) 3965-0328</p>
        <p className="font-body text-xs opacity-60">© 2024 Suinã Instituto Socioambiental</p>
      </div>
    </footer>
  );
};

export default Footer;
