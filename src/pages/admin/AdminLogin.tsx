import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { Lock, Mail } from "lucide-react";
import logoSuina from "@/assets/logo-suina.png";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Erro ao entrar",
        description: "E-mail ou senha incorretos.",
        variant: "destructive",
      });
    } else {
      navigate("/admin");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4 font-['Inter',sans-serif]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src={logoSuina} alt="Instituto Suinã" className="h-16 w-16 object-contain mx-auto mb-4" />
          <h1 className="!text-2xl font-bold text-zinc-800 !font-['Inter',sans-serif]" style={{ fontFamily: "'Inter', sans-serif", fontSize: "1.5rem", color: "#27272a" }}>
            Painel Administrativo
          </h1>
          <p className="!text-sm text-zinc-500 mt-1" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem" }}>
            Entre com suas credenciais para acessar
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-zinc-200 p-6 space-y-4">
          <div className="space-y-2">
            <label className="!text-sm font-medium text-zinc-700" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem" }}>
              E-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                type="email"
                placeholder="admin@institutosuina.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 !text-sm"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="!text-sm font-medium text-zinc-700" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.875rem" }}>
              Senha
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 !text-sm"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium !text-sm"
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <p className="text-center mt-6 !text-xs text-zinc-400" style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.75rem" }}>
          © {new Date().getFullYear()} Instituto Suinã — Painel Administrativo
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
