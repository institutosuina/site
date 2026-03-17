import { FileText, MailPlus, Eye, Plus, Upload, FilePlus } from "lucide-react";
import { Link } from "react-router-dom";

const summaryCards = [
  {
    label: "Total de posts no blog",
    value: "0",
    icon: FileText,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    label: "Novos cadastros na newsletter",
    value: "0",
    icon: MailPlus,
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    label: "Acessos à Prestação de Contas (24h)",
    value: "0",
    icon: Eye,
    color: "text-orange-600",
    bg: "bg-orange-50",
  },
];

const quickActions = [
  { label: "Novo Post", icon: Plus, path: "/admin/content" },
  { label: "Novo Edital", icon: FilePlus, path: "/admin/content" },
  { label: "Upload de Relatório", icon: Upload, path: "/admin/transparency" },
];

const AdminDashboard = () => {
  return (
    <div className="space-y-8 font-['Inter',sans-serif]">
      {/* Page title */}
      <div>
        <h2
          className="font-bold text-zinc-800"
          style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.5rem", color: "#27272a" }}
        >
          Dashboard
        </h2>
        <p
          className="text-zinc-500 mt-1"
          style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem" }}
        >
          Visão geral do Instituto Suinã
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className="bg-white shadow-sm rounded-xl p-6 hover:shadow-md transition-shadow border border-zinc-100"
          >
            <div className="flex items-center gap-4">
              <div className={`${card.bg} p-3 rounded-lg`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <div>
                <p
                  className="text-zinc-500"
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem" }}
                >
                  {card.label}
                </p>
                <p
                  className="font-bold text-zinc-800"
                  style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.875rem", lineHeight: "1" }}
                >
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div>
        <h3
          className="font-semibold text-zinc-800 mb-4"
          style={{ fontFamily: "'Inter', sans-serif", fontSize: "1rem", color: "#27272a" }}
        >
          Acesso rápido
        </h3>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.path}
              className="inline-flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-600 transition-colors"
              style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem" }}
            >
              <action.icon className="h-4 w-4" />
              {action.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity placeholder */}
      <div className="bg-white shadow-sm rounded-xl border border-zinc-100 p-6">
        <h3
          className="font-semibold text-zinc-800 mb-4"
          style={{ fontFamily: "'Inter', sans-serif", fontSize: "1rem", color: "#27272a" }}
        >
          Atividade recente
        </h3>
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
          <p
            className="text-zinc-400"
            style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem" }}
          >
            Nenhuma atividade recente. Comece criando seu primeiro conteúdo!
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
