import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { UserPlus, Mail, Lock, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

const SUPER_ADMIN_EMAIL = "comunicacao@institutosuina.org";

const AdminUsers = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Security check: only SUPER_ADMIN_EMAIL can access this page
  if (user?.email !== SUPER_ADMIN_EMAIL) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <ShieldAlert className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-zinc-800">Acesso Negado</h2>
        <p className="text-zinc-500 mt-2">Você não tem permissão para gerenciar usuários.</p>
      </div>
    );
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: "✅ Usuário cadastrado!",
        description: `O usuário ${email} foi registrado com sucesso.`,
      });
      
      setEmail("");
      setPassword("");
    } catch (error: any) {
      toast({
        title: "❌ Erro ao cadastrar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const s = { fontFamily: "'Inter', sans-serif" } as const;

  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      <div>
        <h2 className="font-bold text-zinc-800" style={{ ...s, fontSize: "1.5rem" }}>Gerenciar Usuários</h2>
        <p style={{ ...s, fontSize: "0.875rem" }} className="text-zinc-500 mt-1">
          Cadastre novos administradores para o sistema
        </p>
      </div>

      <div className="max-w-md bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
        <h3 className="font-semibold text-zinc-800 mb-4 flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-emerald-600" />
          Novo Administrador
        </h3>
        
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-2">
            <label style={{ ...s, fontSize: "0.8125rem" }} className="font-medium text-zinc-700">E-mail</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                type="email"
                placeholder="usuario@institutosuina.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 !text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label style={{ ...s, fontSize: "0.8125rem" }} className="font-medium text-zinc-700">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 !text-sm"
                required
                minLength={6}
              />
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium !text-sm"
          >
            {loading ? "Cadastrando..." : "Cadastrar Usuário"}
          </Button>
        </form>

        <div className="mt-6 p-4 bg-zinc-50 rounded-lg border border-zinc-100">
          <p className="text-[11px] text-zinc-500 leading-relaxed">
            <strong>Nota:</strong> Dependendo das configurações do Supabase, o novo usuário pode precisar confirmar o e-mail antes de conseguir logar. 
            Se a confirmação estiver desativada, eles poderão entrar imediatamente.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
