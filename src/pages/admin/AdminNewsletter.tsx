import { Mail, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const AdminNewsletter = () => {
  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2
            className="font-bold text-zinc-800"
            style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.5rem", color: "#27272a" }}
          >
            Newsletter
          </h2>
          <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem" }} className="text-zinc-500 mt-1">
            Gerencie inscritos e envie e-mail marketing
          </p>
        </div>
        <Button className="bg-emerald-500 hover:bg-emerald-600 text-white !text-sm">
          <Mail className="h-4 w-4 mr-2" />
          Enviar E-mail Marketing
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
        <Input
          placeholder="Buscar inscritos..."
          className="pl-10 !text-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-zinc-50">
              <TableHead style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem" }} className="font-semibold text-zinc-600">Nome</TableHead>
              <TableHead style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem" }} className="font-semibold text-zinc-600">E-mail</TableHead>
              <TableHead style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem" }} className="font-semibold text-zinc-600 hidden sm:table-cell">Data de Inscrição</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell colSpan={3} className="text-center py-12">
                <Users className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
                <p style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem" }} className="text-zinc-400">
                  Nenhum inscrito ainda.
                </p>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AdminNewsletter;
