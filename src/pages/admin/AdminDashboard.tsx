import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FileText, MailPlus, Eye, Plus, Upload, FilePlus } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

const s = { fontFamily: "'Inter', sans-serif" } as const;

const quickActions = [
  { label: "Novo Post", icon: Plus, path: "/admin/content" },
  { label: "Novo Edital", icon: FilePlus, path: "/admin/content" },
  { label: "Upload de Relatório", icon: Upload, path: "/admin/transparency" },
];

const AdminDashboard = () => {
  const { data: blogCount, isLoading: l1 } = useQuery({
    queryKey: ["dashboard-blog-count"],
    queryFn: async () => {
      const { count, error } = await supabase.from("posts_blog").select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: subCount, isLoading: l2 } = useQuery({
    queryKey: ["dashboard-sub-count"],
    queryFn: async () => {
      const { count, error } = await supabase.from("subscribers").select("*", { count: "exact", head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  const { data: accessCount, isLoading: l3 } = useQuery({
    queryKey: ["dashboard-access-count"],
    queryFn: async () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { count, error } = await supabase.from("acessos_relatorios").select("*", { count: "exact", head: true }).gte("access_time", yesterday);
      if (error) throw error;
      return count || 0;
    },
  });

  const cards = [
    { label: "Total de posts no blog", value: blogCount, loading: l1, icon: FileText, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Novos cadastros na newsletter", value: subCount, loading: l2, icon: MailPlus, color: "text-green-600", bg: "bg-green-50" },
    { label: "Acessos à Prestação de Contas (24h)", value: accessCount, loading: l3, icon: Eye, color: "text-orange-600", bg: "bg-orange-50" },
  ];

  return (
    <div className="space-y-8 font-['Inter',sans-serif]">
      <div>
        <h2 className="font-bold text-zinc-800" style={{ ...s, fontSize: "1.5rem", color: "#27272a" }}>Dashboard</h2>
        <p className="text-zinc-500 mt-1" style={{ ...s, fontSize: "0.875rem" }}>Visão geral do Instituto Suinã</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card) => (
          <div key={card.label} className="bg-white shadow-sm rounded-xl p-6 hover:shadow-md transition-shadow border border-zinc-100">
            <div className="flex items-center gap-4">
              <div className={`${card.bg} p-3 rounded-lg`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
              <div>
                <p className="text-zinc-500" style={{ ...s, fontSize: "0.8125rem" }}>{card.label}</p>
                {card.loading ? (
                  <Skeleton className="h-8 w-16 mt-1" />
                ) : (
                  <p className="font-bold text-zinc-800" style={{ ...s, fontSize: "1.875rem", lineHeight: "1" }}>{card.value}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div>
        <h3 className="font-semibold text-zinc-800 mb-4" style={{ ...s, fontSize: "1rem", color: "#27272a" }}>Acesso rápido</h3>
        <div className="flex flex-wrap gap-3">
          {quickActions.map((action) => (
            <Link key={action.label} to={action.path}
              className="inline-flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-600 transition-colors"
              style={{ ...s, fontSize: "0.875rem" }}>
              <action.icon className="h-4 w-4" /> {action.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
