import { useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check } from "lucide-react";
import { PIX_KEY, PIX_KEY_FORMATTED, buildPixPayload, formatBRL } from "@/lib/pix";

interface PixDonationProps {
  /** Valor fixo (loja). Sem valor, o doador escolhe quanto doar. */
  amount?: number;
  reference?: string;
}

const PixDonation = ({ amount, reference }: PixDonationProps) => {
  const [copied, setCopied] = useState<"key" | "code" | null>(null);
  const payload = useMemo(() => buildPixPayload(amount, reference), [amount, reference]);

  const copy = async (text: string, which: "key" | "code") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(which);
      setTimeout(() => setCopied(null), 2500);
    } catch {
      window.prompt("Copie:", text);
    }
  };

  return (
    <div className="space-y-4 font-body text-sm text-center">
      <p className="opacity-90">{amount ? `Pague ${formatBRL(amount)} via PIX:` : "Doe via PIX:"}</p>

      <div className="bg-white p-4 rounded-2xl shadow-sm inline-block border border-suina-cream-dark">
        <QRCodeSVG value={payload} size={176} level="M" marginSize={0} />
      </div>
      <p className="text-xs opacity-70">Aponte a câmera do app do seu banco</p>

      <div className="bg-card p-4 rounded-xl shadow-sm">
        <p className="text-xs uppercase tracking-wide opacity-70 mb-1">Chave PIX (CNPJ)</p>
        <p className="font-bold text-primary text-base">{PIX_KEY_FORMATTED}</p>
        <p className="opacity-70">Instituto Suinã</p>
      </div>

      <button
        type="button"
        onClick={() => copy(amount ? payload : PIX_KEY, amount ? "code" : "key")}
        className="w-full py-3 bg-suina-red text-primary-foreground rounded-xl font-display font-bold hover:opacity-90 transition-colors shadow-md inline-flex items-center justify-center gap-2"
      >
        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
        {copied ? "Copiado!" : amount ? "Copiar Pix Copia e Cola" : "Copiar Chave PIX"}
      </button>
      {amount ? (
        <button
          type="button"
          onClick={() => copy(PIX_KEY, "key")}
          className="text-xs underline opacity-70"
        >
          {copied === "key" ? "Chave copiada!" : "Copiar só a chave"}
        </button>
      ) : null}
    </div>
  );
};

export default PixDonation;
