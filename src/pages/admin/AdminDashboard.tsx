import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import {
  FileText,
  Newspaper,
  ClipboardList,
  BookOpen,
  Megaphone,
  Users,
  Folder,
  FileBarChart,
  MailPlus,
  Eye,
  Download,
  TrendingUp,
  Activity,
  UserPlus,
  Plus,
  Upload,
  FilePlus,
  ArrowUpRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";

const s = { fontFamily: "'Inter', sans-serif" } as const;
const SUPER_ADMIN_EMAIL = "comunicacao@institutosuina.org";

type RangeKey = "7d" | "30d" | "90d";
const RANGES: { key: RangeKey; label: string; days: number }[] = [
  { key: "7d", label: "7 dias", days: 7 },
  { key: "30d", label: "30 dias", days: 30 },
  { key: "90d", label: "90 dias", days: 90 },
];

const isoDaysAgo = (days: number) =>
  new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

const fmtDateBR = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

const fmtDateTimeBR = (iso: string) =>
  new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

const buildDailySeries = (
  rows: { created_at?: string; access_time?: string }[] | undefined,
  field: "created_at" | "access_time",
  days: number,
) => {
  const map = new Map<string, number>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    map.set(key, 0);
  }
  rows?.forEach((r) => {
    const ts = (r as Record<string, string | undefined>)[field];
    if (!ts) return;
    const key = ts.slice(0, 10);
    if (map.has(key)) map.set(key, (map.get(key) ?? 0) + 1);
  });
  return Array.from(map.entries()).map(([k, v]) => ({
    date: fmtDateBR(`${k}T00:00:00Z`),
    value: v,
  }));
};

const StatCard = ({
  label,
  value,
  loading,
  icon: Icon,
  color,
  bg,
  to,
}: {
  label: string;
  value: number | undefined;
  loading: boolean;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  to?: string;
}) => {
  const inner = (
    <div className="bg-white shadow-sm rounded-xl p-5 hover:shadow-md transition-shadow border border-zinc-100 h-full">
      <div className="flex items-start justify-between gap-3">
        <div className={`${bg} p-2.5 rounded-lg`}>
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
        {to && <ArrowUpRight className="h-4 w-4 text-zinc-300" />}
      </div>
      <p className="text-zinc-500 mt-3" style={{ ...s, fontSize: "0.8125rem" }}>{label}</p>
      {loading ? (
        <Skeleton className="h-7 w-20 mt-1.5" />
      ) : (
        <p className="font-bold text-zinc-800 mt-1" style={{ ...s, fontSize: "1.5rem", lineHeight: "1.1" }}>
          {value ?? 0}
        </p>
      )}
    </div>
  );
  return to ? <Link to={to}>{inner}</Link> : inner;
};

const SectionCard = ({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className="bg-white shadow-sm rounded-xl p-5 border border-zinc-100">
    <div className="flex items-start justify-between gap-3 mb-4">
      <div>
        <h3 className="font-bold text-zinc-800" style={{ ...s, fontSize: "0.9375rem" }}>{title}</h3>
        {subtitle && (
          <p className="text-zinc-500 mt-0.5" style={{ ...s, fontSize: "0.75rem" }}>{subtitle}</p>
        )}
      </div>
      {right}
    </div>
    {children}
  </div>
);

const RangeTabs = ({
  value,
  onChange,
}: {
  value: RangeKey;
  onChange: (v: RangeKey) => void;
}) => (
  <div className="inline-flex rounded-lg bg-zinc-100 p-1">
    {RANGES.map((r) => (
      <button
        key={r.key}
        onClick={() => onChange(r.key)}
        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
          value === r.key ? "bg-white text-zinc-800 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
        }`}
        style={s}
      >
        {r.label}
      </button>
    ))}
  </div>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [range, setRange] = useState<RangeKey>("30d");
  const rangeDays = RANGES.find((r) => r.key === range)?.days ?? 30;
  const rangeIso = useMemo(() => isoDaysAgo(rangeDays), [rangeDays]);

  // ============ COUNTS ============
  const counts = useQuery({
    queryKey: ["dashboard-counts"],
    queryFn: async () => {
      const tables = [
        "posts_blog",
        "noticias",
        "editais",
        "material_tecnico",
        "informativos",
        "projetos",
        "relatorios",
        "parceiros",
        "subscribers",
      ] as const;

      const results = await Promise.all(
        tables.map((t) =>
          supabase
            .from(t as any)
            .select("*", { count: "exact", head: true })
            .then((r) => (r.error ? 0 : r.count ?? 0)),
        ),
      );
      return Object.fromEntries(tables.map((t, i) => [t, results[i]])) as Record<typeof tables[number], number>;
    },
  });

  // ============ TIME SERIES — subscribers in range ============
  const subsSeries = useQuery({
    queryKey: ["dashboard-subs-series", range],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscribers")
        .select("created_at")
        .gte("created_at", rangeIso)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return buildDailySeries(data, "created_at", rangeDays);
    },
  });

  // ============ TIME SERIES — page accesses in range ============
  const pageAccessSeries = useQuery({
    queryKey: ["dashboard-page-access-series", range],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("acessos_pagina")
        .select("access_time, page")
        .gte("access_time", rangeIso)
        .order("access_time", { ascending: true });
      if (error) throw error;
      return {
        series: buildDailySeries(data, "access_time", rangeDays),
        total: data?.length ?? 0,
        rows: data ?? [],
      };
    },
  });

  // ============ TOP páginas mais acessadas (no range) ============
  const topPages = useMemo(() => {
    const rows = pageAccessSeries.data?.rows ?? [];
    const map = new Map<string, number>();
    rows.forEach((r) => {
      const p = (r as { page?: string }).page || "/";
      map.set(p, (map.get(p) ?? 0) + 1);
    });
    return Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([page, count]) => ({ page, count }));
  }, [pageAccessSeries.data]);

  // ============ TOP relatórios mais baixados ============
  const topReports = useQuery({
    queryKey: ["dashboard-top-reports", range],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("acessos_relatorios")
        .select("report_id, relatorios(title)")
        .gte("access_time", rangeIso);
      if (error) throw error;
      const map = new Map<string, { title: string; count: number }>();
      (data ?? []).forEach((r: any) => {
        const id = r.report_id as string;
        const title = r.relatorios?.title ?? "Relatório removido";
        const prev = map.get(id);
        map.set(id, { title, count: (prev?.count ?? 0) + 1 });
      });
      return Array.from(map.values()).sort((a, b) => b.count - a.count).slice(0, 6);
    },
  });

  // ============ ATIVIDADE RECENTE ============
  const recentPosts = useQuery({
    queryKey: ["dashboard-recent-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("posts_blog")
        .select("id, title, slug, status, created_at, published_at")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data ?? [];
    },
  });

  const recentNews = useQuery({
    queryKey: ["dashboard-recent-news"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("noticias")
        .select("id, title, slug, status, created_at, published_at")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data ?? [];
    },
  });

  const recentSubscribers = useQuery({
    queryKey: ["dashboard-recent-subs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscribers")
        .select("id, name, email, created_at")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data ?? [];
    },
  });

  const recentReports = useQuery({
    queryKey: ["dashboard-recent-reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("relatorios")
        .select("id, title, created_at, projetos(name)")
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data ?? [];
    },
  });

  // ============ EDITAIS POR STATUS ============
  const editaisStatus = useQuery({
    queryKey: ["dashboard-editais-status"],
    queryFn: async () => {
      const { data, error } = await supabase.from("editais").select("status");
      if (error) throw error;
      const map = new Map<string, number>();
      (data ?? []).forEach((r: any) => {
        const k = r.status || "outros";
        map.set(k, (map.get(k) ?? 0) + 1);
      });
      return Array.from(map.entries()).map(([status, count]) => ({ status, count }));
    },
  });

  // ============ NEWSLETTER ATÉ HOJE TOTAL ============
  const newsletterGrowth = useQuery({
    queryKey: ["dashboard-newsletter-growth", range],
    queryFn: async () => {
      const { count: total, error } = await supabase
        .from("subscribers")
        .select("*", { count: "exact", head: true });
      if (error) throw error;
      const { count: inRange } = await supabase
        .from("subscribers")
        .select("*", { count: "exact", head: true })
        .gte("created_at", rangeIso);
      return { total: total ?? 0, inRange: inRange ?? 0 };
    },
  });

  const totalAccess = pageAccessSeries.data?.total ?? 0;

  // ============ Stat cards definitions ============
  const statCards = [
    { label: "Posts no blog", value: counts.data?.posts_blog, loading: counts.isLoading, icon: FileText, color: "text-blue-600", bg: "bg-blue-50", to: "/admin/blog" },
    { label: "Notícias", value: counts.data?.noticias, loading: counts.isLoading, icon: Newspaper, color: "text-indigo-600", bg: "bg-indigo-50", to: "/admin/noticias" },
    { label: "Editais", value: counts.data?.editais, loading: counts.isLoading, icon: ClipboardList, color: "text-amber-600", bg: "bg-amber-50", to: "/admin/editais" },
    { label: "Material Técnico", value: counts.data?.material_tecnico, loading: counts.isLoading, icon: BookOpen, color: "text-rose-600", bg: "bg-rose-50", to: "/admin/material-tecnico" },
    { label: "Informativos", value: counts.data?.informativos, loading: counts.isLoading, icon: Megaphone, color: "text-orange-600", bg: "bg-orange-50", to: "/admin/informativos" },
    { label: "Projetos", value: counts.data?.projetos, loading: counts.isLoading, icon: Folder, color: "text-emerald-600", bg: "bg-emerald-50", to: "/admin/transparency" },
    { label: "Relatórios", value: counts.data?.relatorios, loading: counts.isLoading, icon: FileBarChart, color: "text-teal-600", bg: "bg-teal-50", to: "/admin/transparency" },
    { label: "Parceiros", value: counts.data?.parceiros, loading: counts.isLoading, icon: Users, color: "text-purple-600", bg: "bg-purple-50", to: "/admin/partners" },
  ];

  const quickActions = [
    { label: "Novo Post", icon: Plus, path: "/admin/content/posts_blog/new" },
    { label: "Nova Notícia", icon: Newspaper, path: "/admin/content/noticias/new" },
    { label: "Novo Edital", icon: FilePlus, path: "/admin/content/editais/new" },
    { label: "Upload Relatório", icon: Upload, path: "/admin/transparency" },
  ];

  const statusColor = (st?: string) => {
    if (st === "published") return "bg-emerald-100 text-emerald-700";
    if (st === "draft") return "bg-zinc-100 text-zinc-600";
    return "bg-amber-100 text-amber-700";
  };

  const statusLabel = (st?: string) => {
    if (st === "published") return "Publicado";
    if (st === "draft") return "Rascunho";
    return st || "—";
  };

  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="font-bold text-zinc-800" style={{ ...s, fontSize: "1.5rem", color: "#27272a" }}>Dashboard</h2>
          <p className="text-zinc-500 mt-1" style={{ ...s, fontSize: "0.875rem" }}>
            Visão geral do Instituto Suinã — métricas, atividade e crescimento
          </p>
        </div>
        <RangeTabs value={range} onChange={setRange} />
      </div>

      {/* TOP HIGHLIGHTS — KPIs principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-sm rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-lg">
              <Eye className="h-5 w-5" />
            </div>
            <p style={{ ...s, fontSize: "0.8125rem" }} className="opacity-90">Acessos ao site</p>
          </div>
          <p className="font-bold mt-3" style={{ ...s, fontSize: "1.875rem", lineHeight: "1" }}>
            {pageAccessSeries.isLoading ? "—" : totalAccess.toLocaleString("pt-BR")}
          </p>
          <p className="text-xs opacity-80 mt-1" style={s}>nos últimos {rangeDays} dias</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-lg">
              <MailPlus className="h-5 w-5" />
            </div>
            <p style={{ ...s, fontSize: "0.8125rem" }} className="opacity-90">Newsletter</p>
          </div>
          <p className="font-bold mt-3" style={{ ...s, fontSize: "1.875rem", lineHeight: "1" }}>
            {newsletterGrowth.isLoading ? "—" : newsletterGrowth.data?.total?.toLocaleString("pt-BR") ?? 0}
          </p>
          <p className="text-xs opacity-80 mt-1" style={s}>
            <TrendingUp className="inline h-3 w-3 mr-1" />
            +{newsletterGrowth.data?.inRange ?? 0} nos últimos {rangeDays} dias
          </p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-sm rounded-xl p-5">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2.5 rounded-lg">
              <Download className="h-5 w-5" />
            </div>
            <p style={{ ...s, fontSize: "0.8125rem" }} className="opacity-90">Downloads de relatórios</p>
          </div>
          <p className="font-bold mt-3" style={{ ...s, fontSize: "1.875rem", lineHeight: "1" }}>
            {topReports.isLoading
              ? "—"
              : (topReports.data?.reduce((acc, r) => acc + r.count, 0) ?? 0).toLocaleString("pt-BR")}
          </p>
          <p className="text-xs opacity-80 mt-1" style={s}>nos últimos {rangeDays} dias</p>
        </div>
      </div>

      {/* Cards de conteúdo */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((c) => (
          <StatCard key={c.label} {...c} />
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard
          title="Acessos ao site"
          subtitle={`Visitas únicas por dia — últimos ${rangeDays} dias`}
        >
          <div className="h-56">
            {pageAccessSeries.isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={pageAccessSeries.data?.series ?? []}>
                  <defs>
                    <linearGradient id="gAccess" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#71717a" }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11, fill: "#71717a" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e4e4e7" }}
                    labelStyle={{ color: "#27272a" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    name="Acessos"
                    stroke="#10b981"
                    strokeWidth={2}
                    fill="url(#gAccess)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Novos inscritos na newsletter"
          subtitle={`Inscrições por dia — últimos ${rangeDays} dias`}
        >
          <div className="h-56">
            {subsSeries.isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={subsSeries.data ?? []}>
                  <defs>
                    <linearGradient id="gSubs" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#71717a" }} interval="preserveStartEnd" />
                  <YAxis tick={{ fontSize: 11, fill: "#71717a" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e4e4e7" }}
                    labelStyle={{ color: "#27272a" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    name="Inscritos"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fill="url(#gSubs)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </SectionCard>
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="Páginas mais acessadas" subtitle={`No período de ${rangeDays} dias`}>
          {pageAccessSeries.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          ) : topPages.length === 0 ? (
            <p className="text-zinc-400 text-sm py-6 text-center" style={s}>
              Sem dados de acesso no período.
            </p>
          ) : (
            <div className="space-y-2.5">
              {topPages.map((p, i) => {
                const max = topPages[0].count || 1;
                const pct = (p.count / max) * 100;
                return (
                  <div key={p.page} className="space-y-1">
                    <div className="flex items-center justify-between text-xs" style={s}>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-zinc-400 font-mono w-4 shrink-0">#{i + 1}</span>
                        <span className="text-zinc-700 truncate font-medium">{p.page}</span>
                      </div>
                      <span className="font-semibold text-zinc-800 shrink-0 ml-2">{p.count}</span>
                    </div>
                    <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Relatórios mais baixados" subtitle={`No período de ${rangeDays} dias`}>
          {topReports.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          ) : (topReports.data?.length ?? 0) === 0 ? (
            <p className="text-zinc-400 text-sm py-6 text-center" style={s}>
              Nenhum download registrado no período.
            </p>
          ) : (
            <div className="space-y-2.5">
              {(topReports.data ?? []).map((r, i) => {
                const max = topReports.data![0].count || 1;
                const pct = (r.count / max) * 100;
                return (
                  <div key={`${r.title}-${i}`} className="space-y-1">
                    <div className="flex items-center justify-between text-xs" style={s}>
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-zinc-400 font-mono w-4 shrink-0">#{i + 1}</span>
                        <span className="text-zinc-700 truncate font-medium">{r.title}</span>
                      </div>
                      <span className="font-semibold text-zinc-800 shrink-0 ml-2">{r.count}</span>
                    </div>
                    <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>

      {/* Editais por status (gráfico de barras) + Newsletter recente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SectionCard title="Editais por status" subtitle="Distribuição total">
          <div className="h-52">
            {editaisStatus.isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (editaisStatus.data?.length ?? 0) === 0 ? (
              <p className="text-zinc-400 text-sm py-6 text-center" style={s}>Nenhum edital cadastrado.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={editaisStatus.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f4f4f5" />
                  <XAxis
                    dataKey="status"
                    tick={{ fontSize: 11, fill: "#71717a" }}
                    tickFormatter={(v) => statusLabel(v)}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#71717a" }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e4e4e7" }}
                    labelFormatter={(v) => statusLabel(v as string)}
                  />
                  <Bar dataKey="count" name="Editais" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </SectionCard>

        <SectionCard
          title="Últimos inscritos"
          subtitle="Newsletter"
          right={<Link to="/admin/newsletter" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium" style={s}>Ver todos →</Link>}
        >
          {recentSubscribers.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (recentSubscribers.data?.length ?? 0) === 0 ? (
            <p className="text-zinc-400 text-sm py-6 text-center" style={s}>Sem inscritos ainda.</p>
          ) : (
            <ul className="space-y-2.5">
              {recentSubscribers.data?.map((sub) => (
                <li key={sub.id} className="flex items-center gap-2.5 min-w-0">
                  <div className="h-7 w-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-semibold text-xs shrink-0" style={s}>
                    {sub.name?.charAt(0).toUpperCase() ?? "?"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-zinc-800 truncate font-medium" style={{ ...s, fontSize: "0.8125rem" }}>{sub.name}</p>
                    <p className="text-zinc-400 truncate" style={{ ...s, fontSize: "0.6875rem" }}>{sub.email}</p>
                  </div>
                  <span className="text-zinc-400 text-[10px] shrink-0" style={s}>{fmtDateTimeBR(sub.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Últimos relatórios"
          subtitle="Prestação de contas"
          right={<Link to="/admin/transparency" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium" style={s}>Ver todos →</Link>}
        >
          {recentReports.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (recentReports.data?.length ?? 0) === 0 ? (
            <p className="text-zinc-400 text-sm py-6 text-center" style={s}>Sem relatórios ainda.</p>
          ) : (
            <ul className="space-y-2.5">
              {recentReports.data?.map((r: any) => (
                <li key={r.id} className="flex items-start gap-2.5 min-w-0">
                  <div className="h-7 w-7 rounded-md bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
                    <FileBarChart className="h-3.5 w-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-zinc-800 truncate font-medium" style={{ ...s, fontSize: "0.8125rem" }}>{r.title}</p>
                    <p className="text-zinc-400 truncate" style={{ ...s, fontSize: "0.6875rem" }}>
                      {r.projetos?.name || "Sem projeto"} · {fmtDateTimeBR(r.created_at)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      {/* Atividade recente — Posts + Notícias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard
          title="Últimos posts do blog"
          right={<Link to="/admin/blog" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium" style={s}>Gerenciar →</Link>}
        >
          {recentPosts.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (recentPosts.data?.length ?? 0) === 0 ? (
            <p className="text-zinc-400 text-sm py-6 text-center" style={s}>Nenhum post ainda.</p>
          ) : (
            <ul className="space-y-2">
              {recentPosts.data?.map((p: any) => (
                <li key={p.id} className="flex items-center gap-2.5 min-w-0 py-1.5">
                  <FileText className="h-4 w-4 text-blue-500 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-zinc-800 truncate font-medium" style={{ ...s, fontSize: "0.8125rem" }}>{p.title}</p>
                    <p className="text-zinc-400 truncate" style={{ ...s, fontSize: "0.6875rem" }}>{fmtDateTimeBR(p.created_at)}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor(p.status)}`} style={s}>
                    {statusLabel(p.status)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Últimas notícias"
          right={<Link to="/admin/noticias" className="text-xs text-emerald-600 hover:text-emerald-700 font-medium" style={s}>Gerenciar →</Link>}
        >
          {recentNews.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : (recentNews.data?.length ?? 0) === 0 ? (
            <p className="text-zinc-400 text-sm py-6 text-center" style={s}>Nenhuma notícia ainda.</p>
          ) : (
            <ul className="space-y-2">
              {recentNews.data?.map((n: any) => (
                <li key={n.id} className="flex items-center gap-2.5 min-w-0 py-1.5">
                  <Newspaper className="h-4 w-4 text-indigo-500 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-zinc-800 truncate font-medium" style={{ ...s, fontSize: "0.8125rem" }}>{n.title}</p>
                    <p className="text-zinc-400 truncate" style={{ ...s, fontSize: "0.6875rem" }}>{fmtDateTimeBR(n.created_at)}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColor(n.status)}`} style={s}>
                    {statusLabel(n.status)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      {/* Acesso rápido */}
      <div className="bg-white shadow-sm rounded-xl p-5 border border-zinc-100">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4 text-emerald-600" />
          <h3 className="font-bold text-zinc-800" style={{ ...s, fontSize: "0.9375rem" }}>Acesso rápido</h3>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.path}
              className="inline-flex items-center gap-2 bg-emerald-500 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-emerald-600 transition-colors"
              style={{ ...s, fontSize: "0.8125rem" }}
            >
              <action.icon className="h-4 w-4" /> {action.label}
            </Link>
          ))}
          {user?.email === SUPER_ADMIN_EMAIL && (
            <Link
              to="/admin/users"
              className="inline-flex items-center gap-2 bg-zinc-800 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-zinc-900 transition-colors"
              style={{ ...s, fontSize: "0.8125rem" }}
            >
              <UserPlus className="h-4 w-4" /> Gerenciar Usuários
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
