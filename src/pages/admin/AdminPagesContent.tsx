import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Save, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { defaultHomePageContent, type HomePageContent, type TimelineItem } from "@/data/pageContentDefaults";
import { defaultSocialLinks, type SocialLinksContent } from "@/data/socialLinksDefaults";
import { defaultTransparenciaPageContent, type TransparenciaPageContent } from "@/data/transparenciaPageDefaults";

const s = { fontFamily: "'Inter', sans-serif" } as const;

const normalizeHomeContent = (raw: unknown): HomePageContent => {
  const fallback = defaultHomePageContent;
  if (!raw || typeof raw !== "object") return fallback;
  const source = raw as Partial<HomePageContent>;

  const timeline = Array.isArray(source.timeline)
    ? source.timeline
        .filter(
          (item): item is TimelineItem =>
            !!item &&
            typeof item === "object" &&
            typeof (item as TimelineItem).year === "string" &&
            typeof (item as TimelineItem).text === "string",
        )
        .map((item) => ({ year: item.year.trim(), text: item.text.trim() }))
    : fallback.timeline;

  return {
    quemSomos: typeof source.quemSomos === "string" ? source.quemSomos : fallback.quemSomos,
    mission: typeof source.mission === "string" ? source.mission : fallback.mission,
    vision: typeof source.vision === "string" ? source.vision : fallback.vision,
    values: typeof source.values === "string" ? source.values : fallback.values,
    timeline: timeline.length ? timeline : fallback.timeline,
  };
};

const normalizeTransparenciaContent = (raw: unknown): TransparenciaPageContent => {
  const fallback = defaultTransparenciaPageContent;
  if (!raw || typeof raw !== "object") return fallback;
  const source = raw as Partial<TransparenciaPageContent>;
  const pick = (key: keyof TransparenciaPageContent) =>
    typeof source[key] === "string" && source[key]!.trim().length > 0 ? source[key]! : fallback[key];
  return {
    heroTitle: pick("heroTitle"),
    heroSubtitle: pick("heroSubtitle"),
    cardLgpd: pick("cardLgpd"),
    cardEstatuto: pick("cardEstatuto"),
    cardPortfolio: pick("cardPortfolio"),
    cardContabeis: pick("cardContabeis"),
    cardResultados: pick("cardResultados"),
    cardPrestacao: pick("cardPrestacao"),
  };
};

const AdminPagesContent = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<HomePageContent>(defaultHomePageContent);
  const [socialForm, setSocialForm] = useState<SocialLinksContent>(defaultSocialLinks);
  const [transparenciaForm, setTransparenciaForm] = useState<TransparenciaPageContent>(defaultTransparenciaPageContent);

  const { isLoading: loadingHome } = useQuery({
    queryKey: ["admin-page-content", "home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_page_content")
        .select("content")
        .eq("page_key", "home")
        .maybeSingle();
      if (error) throw error;

      const normalized = normalizeHomeContent(data?.content);
      setForm(normalized);
      return normalized;
    },
  });

  const { isLoading: loadingSocial } = useQuery({
    queryKey: ["admin-page-content", "social_links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_page_content")
        .select("content")
        .eq("page_key", "social_links")
        .maybeSingle();
      if (error) throw error;

      const content = data?.content as Partial<SocialLinksContent> | undefined;
      setSocialForm({
        whatsapp: typeof content?.whatsapp === "string" ? content.whatsapp : defaultSocialLinks.whatsapp,
        facebook: typeof content?.facebook === "string" ? content.facebook : defaultSocialLinks.facebook,
        instagram: typeof content?.instagram === "string" ? content.instagram : defaultSocialLinks.instagram,
        linkedin: typeof content?.linkedin === "string" ? content.linkedin : defaultSocialLinks.linkedin,
        youtube: typeof content?.youtube === "string" ? content.youtube : defaultSocialLinks.youtube,
      });
      return data;
    },
  });

  const { isLoading: loadingTransparencia } = useQuery({
    queryKey: ["admin-page-content", "transparencia_page"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_page_content")
        .select("content")
        .eq("page_key", "transparencia_page")
        .maybeSingle();
      if (error) throw error;
      const normalized = normalizeTransparenciaContent(data?.content);
      setTransparenciaForm(normalized);
      return normalized;
    },
  });

  const isLoading = loadingHome || loadingSocial || loadingTransparencia;

  const sortedTimeline = useMemo(
    () =>
      [...form.timeline].sort((a, b) => {
        const yearA = parseInt(a.year, 10);
        const yearB = parseInt(b.year, 10);
        if (Number.isNaN(yearA) || Number.isNaN(yearB)) return b.year.localeCompare(a.year);
        return yearB - yearA;
      }),
    [form.timeline],
  );

  const saveMutation = useMutation({
    mutationFn: async () => {
      const homePayload = {
        page_key: "home",
        content: {
          ...form,
          timeline: form.timeline.filter((item) => item.year.trim() && item.text.trim()),
        },
        updated_at: new Date().toISOString(),
      };
      const socialPayload = {
        page_key: "social_links",
        content: socialForm,
        updated_at: new Date().toISOString(),
      };
      const transparenciaPayload = {
        page_key: "transparencia_page",
        content: transparenciaForm,
        updated_at: new Date().toISOString(),
      };

      const [homeResult, socialResult, transparenciaResult] = await Promise.all([
        supabase.from("site_page_content").upsert(homePayload, { onConflict: "page_key" }),
        supabase.from("site_page_content").upsert(socialPayload, { onConflict: "page_key" }),
        supabase.from("site_page_content").upsert(transparenciaPayload, { onConflict: "page_key" }),
      ]);
      if (homeResult.error) throw homeResult.error;
      if (socialResult.error) throw socialResult.error;
      if (transparenciaResult.error) throw transparenciaResult.error;
    },
    onSuccess: () => {
      toast({ title: "✅ Conteúdos de páginas atualizados!" });
      queryClient.invalidateQueries({ queryKey: ["admin-page-content", "home"] });
      queryClient.invalidateQueries({ queryKey: ["admin-page-content", "social_links"] });
      queryClient.invalidateQueries({ queryKey: ["admin-page-content", "transparencia_page"] });
      queryClient.invalidateQueries({ queryKey: ["home-page-content"] });
      queryClient.invalidateQueries({ queryKey: ["social-links-content"] });
      queryClient.invalidateQueries({ queryKey: ["transparencia-page-content"] });
    },
    onError: (error: Error) => {
      toast({ title: "❌ Erro ao salvar", description: error.message, variant: "destructive" });
    },
  });

  const updateTimelineItem = (index: number, field: keyof TimelineItem, value: string) => {
    setForm((current) => {
      const next = [...current.timeline];
      next[index] = { ...next[index], [field]: value };
      return { ...current, timeline: next };
    });
  };

  const removeTimelineItem = (index: number) => {
    setForm((current) => ({
      ...current,
      timeline: current.timeline.filter((_, i) => i !== index),
    }));
  };

  const addTimelineItem = () => {
    const nextYear = new Date().getFullYear().toString();
    setForm((current) => ({
      ...current,
      timeline: [{ year: nextYear, text: "" }, ...current.timeline],
    }));
  };

  return (
    <div className="space-y-8 font-['Inter',sans-serif]">
      <div>
        <h2 className="font-bold text-zinc-800" style={{ ...s, fontSize: "1.5rem" }}>
          Edição de Páginas
        </h2>
        <p style={{ ...s, fontSize: "0.875rem" }} className="text-zinc-500 mt-1">
          Edite os textos institucionais da página inicial e mantenha a linha do tempo atualizada.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-56 w-full" />
        </div>
      ) : (
        <>
          <section className="bg-white border border-zinc-200 rounded-xl p-6 space-y-3">
            <h3 className="font-semibold text-zinc-800" style={s}>Quem somos</h3>
            <Textarea
              value={form.quemSomos}
              onChange={(event) => setForm((current) => ({ ...current, quemSomos: event.target.value }))}
              className="min-h-40"
            />
          </section>

          <section className="bg-white border border-zinc-200 rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-zinc-800" style={s}>Redes sociais</h3>
            <div className="space-y-2">
              <label className="text-sm text-zinc-600">WhatsApp</label>
              <Input value={socialForm.whatsapp} onChange={(event) => setSocialForm((current) => ({ ...current, whatsapp: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-600">Facebook</label>
              <Input value={socialForm.facebook} onChange={(event) => setSocialForm((current) => ({ ...current, facebook: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-600">Instagram</label>
              <Input value={socialForm.instagram} onChange={(event) => setSocialForm((current) => ({ ...current, instagram: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-600">LinkedIn</label>
              <Input value={socialForm.linkedin} onChange={(event) => setSocialForm((current) => ({ ...current, linkedin: event.target.value }))} />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-600">YouTube</label>
              <Input value={socialForm.youtube} onChange={(event) => setSocialForm((current) => ({ ...current, youtube: event.target.value }))} />
            </div>
          </section>

          <section className="bg-white border border-zinc-200 rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-zinc-800" style={s}>Missão, visão e valores</h3>
            <div className="space-y-2">
              <label className="text-sm text-zinc-600">Missão</label>
              <Textarea
                value={form.mission}
                onChange={(event) => setForm((current) => ({ ...current, mission: event.target.value }))}
                className="min-h-24"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-600">Visão</label>
              <Textarea
                value={form.vision}
                onChange={(event) => setForm((current) => ({ ...current, vision: event.target.value }))}
                className="min-h-24"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-600">Valores</label>
              <Textarea
                value={form.values}
                onChange={(event) => setForm((current) => ({ ...current, values: event.target.value }))}
                className="min-h-24"
              />
            </div>
          </section>

          <section className="bg-white border border-zinc-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold text-zinc-800" style={s}>Linha do tempo</h3>
              <Button onClick={addTimelineItem} className="bg-emerald-500 hover:bg-emerald-600 text-white !text-sm">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar ano
              </Button>
            </div>
            <div className="space-y-3">
              {sortedTimeline.map((item) => {
                const originalIndex = form.timeline.findIndex((timelineItem) => timelineItem === item);
                return (
                  <div key={`${item.year}-${originalIndex}`} className="border border-zinc-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <Input
                        value={item.year}
                        onChange={(event) => updateTimelineItem(originalIndex, "year", event.target.value)}
                        className="max-w-32"
                        placeholder="Ano"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto text-zinc-400 hover:text-red-600"
                        onClick={() => removeTimelineItem(originalIndex)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea
                      value={item.text}
                      onChange={(event) => updateTimelineItem(originalIndex, "text", event.target.value)}
                      placeholder="Descrição do marco deste ano"
                      className="min-h-24"
                    />
                  </div>
                );
              })}
            </div>
          </section>

          <section className="bg-white border border-zinc-200 rounded-xl p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-zinc-800" style={s}>Página Transparência</h3>
              <p className="text-xs text-zinc-500 mt-1">
                Edite os textos da página Transparência. Nos títulos dos cards, cada nova linha (Enter) aparece como linha separada no card.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-zinc-600">Título principal</label>
                <Input
                  value={transparenciaForm.heroTitle}
                  onChange={(event) => setTransparenciaForm((current) => ({ ...current, heroTitle: event.target.value }))}
                  placeholder="Transparência"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-zinc-600">Subtítulo</label>
                <Input
                  value={transparenciaForm.heroSubtitle}
                  onChange={(event) => setTransparenciaForm((current) => ({ ...current, heroSubtitle: event.target.value }))}
                  placeholder="Resultados e compromissos:"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {([
                { key: "cardLgpd", label: "Card — LGPD" },
                { key: "cardEstatuto", label: "Card — Estatuto" },
                { key: "cardPortfolio", label: "Card — Portfólio" },
                { key: "cardContabeis", label: "Card — Demonstrativos Contábeis" },
                { key: "cardResultados", label: "Card — Relatórios de Resultados" },
                { key: "cardPrestacao", label: "Card — Prestação de Contas" },
              ] as { key: keyof TransparenciaPageContent; label: string }[]).map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <label className="text-sm text-zinc-600">{label}</label>
                  <Textarea
                    value={transparenciaForm[key]}
                    onChange={(event) => setTransparenciaForm((current) => ({ ...current, [key]: event.target.value }))}
                    className="min-h-24"
                  />
                </div>
              ))}
            </div>
          </section>

          <div className="flex justify-end">
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {saveMutation.isPending ? "Salvando..." : "Salvar alterações"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminPagesContent;
