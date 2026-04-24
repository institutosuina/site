import { useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import NotFound from "./NotFound";

const QR_CODE_NAMES = [
  "Alumã",
  "Angico-branco",
  "Angico-cascudo",
  "Araribá",
  "Araucária",
  "Araçá-amazônico",
  "Araçá",
  "Aroeira-do-cerrado",
  "Aroeira-pimenteira",
  "Avelós",
  "Açoita-cavalo",
  "Bacupari",
  "Cambará",
  "Camboatá-vermelho",
  "Cambuí",
  "Canafístula",
  "Canela-verdadeira",
  "Castanha-do-maranhão",
  "Cedro-rosa",
  "Cereja-do-rio-grande",
  "Cipó Mil-Homens",
  "Copaíba",
  "Cutieira",
  "Embaúba-branca",
  "Embirinha",
  "Erva-Baleeira",
  "Espinheira Santa",
  "Figueira",
  "Gabiroba",
  "Gameleira",
  "Grumixama",
  "Grão-de-Galo",
  "Guapuruvu",
  "Guaçatonga",
  "Ingá-do-brejo",
  "Insulina Vegetal",
  "Ipê-amarelo-do-brejo",
  "Ipê-amarelo-do-cerrado",
  "Ipê-rosa",
  "Ipê-verde",
  "Jacarandá",
  "Jambo-rosa",
  "Jatobá",
  "Jenipapo",
  "Jerivá",
  "Juçara",
  "Leiteira",
  "Magnolia-amarela",
  "Manacá-de-cheiro",
  "Mangueira",
  "Mertiolate",
  "Mirindiba",
  "Nespereira",
  "Palmeira-de-saia- da-Califórnia",
  "Palmeira-imperial",
  "Palmeira-leque-chinesa",
  "Palmeira-real",
  "Pandano",
  "Pau-Jangada",
  "Pau-Pereira",
  "Pau-brasil",
  "Pau-jacaré",
  "Podocarpo",
  "Rabo-de-peixe",
  "Rosa Branca",
  "Santa - bárbara ou cinamomo",
  "Sibipiruna",
  "Suinã ou mulungu",
  "Taiúva",
  "Tamboril",
  "Tipuana",
  "Tucaneira",
  "Urucuri",
  "ingá-mirim",
  "sangra-d'água",
];

/** Set of valid QR code slugs for fast lookup */
const validSlugs = new Set(QR_CODE_NAMES);

const QrCodePage = () => {
  const { slug } = useParams<{ slug: string }>();
  // React Router automatically decodes URL parameters
  const decodedSlug = slug || "";

  const imageName = validSlugs.has(decodedSlug) ? decodedSlug : null;

  if (!imageName) {
    return <NotFound />;
  }

  return (
    <Layout>
      <section className="flex flex-col items-center justify-center py-12 px-4 min-h-[60vh]">
        <img
          src={`/qrcodes/${encodeURIComponent(imageName)}.png`}
          alt={imageName}
          className="max-w-full w-auto max-h-[70vh] rounded-2xl shadow-lg"
        />
        <h1 className="mt-6 text-2xl md:text-3xl font-display font-bold text-[#3e2723] text-center">
          {imageName}
        </h1>
      </section>
    </Layout>
  );
};

export { QR_CODE_NAMES };
export default QrCodePage;
