import { useState } from "react";
import { FileText, Newspaper, BookOpen, ClipboardList, Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const tabs = [
  { key: "blog", label: "Blog", icon: FileText },
  { key: "noticias", label: "Notícias", icon: Newspaper },
  { key: "material", label: "Material Técnico", icon: BookOpen },
  { key: "editais", label: "Editais", icon: ClipboardList },
];

const mockPosts = [
  {
    id: "1",
    title: "Projeto de restauração na Serra do Mar",
    slug: "projeto-restauracao-serra-do-mar",
    status: "Publicado",
    published_at: "2026-03-10",
  },
  {
    id: "2",
    title: "Relatório anual de atividades 2025",
    slug: "relatorio-anual-2025",
    status: "Rascunho",
    published_at: null,
  },
];

const AdminContent = () => {
  const [activeTab, setActiveTab] = useState("blog");

  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2
            className="font-bold text-zinc-800"
            style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.5rem", color: "#27272a" }}
          >
            Gestão de Conteúdo
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem" }} className="text-zinc-500 mt-1">
            Gerencie blog, notícias, materiais e editais
          </p>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white !text-sm">
          <Plus className="h-4 w-4 mr-2" />
          Adicionar
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-zinc-100 p-1 rounded-lg overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
            style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem" }}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50">
              <TableHead style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem" }} className="font-semibold text-zinc-600">Título</TableHead>
              <TableHead style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem" }} className="font-semibold text-zinc-600 hidden md:table-cell">Slug</TableHead>
              <TableHead style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem" }} className="font-semibold text-zinc-600">Status</TableHead>
              <TableHead style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem" }} className="font-semibold text-zinc-600 hidden sm:table-cell">Data</TableHead>
              <TableHead style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem" }} className="font-semibold text-zinc-600 text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockPosts.map((post) => (
              <TableRow key={post.id} className="hover:bg-zinc-50">
                <TableCell style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem" }} className="font-medium text-zinc-800">
                  {post.title}
                </TableCell>
                <TableCell style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem" }} className="text-zinc-400 hidden md:table-cell">
                  {post.slug}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      post.status === "Publicado"
                        ? "bg-green-50 text-green-700"
                        : "bg-yellow-50 text-yellow-700"
                    }`}
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {post.status}
                  </span>
                </TableCell>
                <TableCell style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.8125rem" }} className="text-zinc-500 hidden sm:table-cell">
                  {post.published_at || "—"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-blue-600">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminContent;
