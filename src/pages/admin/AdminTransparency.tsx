import { Upload, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

const AdminTransparency = () => {
  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      <div>
        <h2
          className="font-bold text-zinc-800"
          style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.5rem", color: "#27272a" }}
        >
          Transparência e Prestação de Contas
        </h2>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem" }} className="text-zinc-500 mt-1">
          Gerencie relatórios e acompanhe acessos
        </p>
      </div>

      {/* Upload area */}
      <div className="bg-white rounded-xl border-2 border-dashed border-zinc-300 p-12 text-center hover:border-emerald-400 transition-colors">
        <Upload className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem" }} className="font-medium text-zinc-600 mb-2">
          Arraste um PDF ou clique para enviar
        </p>
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem" }} className="text-zinc-400 mb-4">
          Formatos aceitos: PDF — Máx. 20MB
        </p>
        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white !text-sm">
          <Upload className="h-4 w-4 mr-2" />
          Selecionar arquivo
        </Button>
      </div>

      {/* Empty state */}
      <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center">
        <FileText className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
        <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem" }} className="text-zinc-400">
          Nenhum relatório enviado ainda.
        </p>
      </div>
    </div>
  );
};

export default AdminTransparency;
