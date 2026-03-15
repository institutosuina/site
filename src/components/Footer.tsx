import folhaSvg from "@/assets/folha.svg";

const Footer = () => {
  return (
    <footer className="footer-bg relative z-20 text-card">

      {/* FOLHA ESQUERDA (Vaza para cima) */}
      <div className="absolute -top-24 bottom-0 -left-24 w-[400px] md:-top-40 md:-left-40 md:w-[700px] overflow-hidden pointer-events-none z-10">
        <div
          className="absolute top-0 left-0 h-[400px] w-[400px] bg-left-bottom bg-no-repeat bg-contain opacity-30 md:h-[700px] md:w-[700px] md:opacity-100"
          style={{ backgroundImage: `url(${folhaSvg})` }}
          aria-hidden="true"
        />
      </div>

      {/* FOLHA DIREITA (Ajustada para tamanho fixo maior e corte perfeito) */}
      <div className="absolute right-0 bottom-0 top-0 w-[300px] md:w-[500px] overflow-hidden pointer-events-none z-0">
        <div
          className="absolute top-0 left-0 h-[400px] w-[400px] bg-left-bottom bg-no-repeat bg-contain opacity-30 md:h-[700px] md:w-[700px] md:opacity-100 -scale-x-100"
          style={{ backgroundImage: `url(${folhaSvg})` }}
          aria-hidden="true"
        />
      </div>

      {/* CONTEÚDO DO FOOTER */}
      <div className="container mx-auto py-12 px-4 text-center relative z-10">
        <p className="font-display text-lg font-semibold mb-4">Suinã Instituto Socioambiental</p>
        <div className="space-y-1 font-body text-sm opacity-80 mb-4">
          <p className="font-normal">Rua Capitão Alberto Aguiar Weisshon, 337 - Centro - Guararema/SP.</p>
          <p className="font-normal">21.766.841/0001-84</p>
          <p className="font-normal">contato@institutosuina.org</p>
          <p className="font-normal">(12) 3965-0328</p>
        </div>
        <p className="font-body text-xs opacity-60 font-normal">
          © {new Date().getFullYear()} Suinã Instituto Socioambiental. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;