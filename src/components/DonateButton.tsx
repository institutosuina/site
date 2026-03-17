import { Plus } from "lucide-react";

const DonateButton = () => {
  return (
    <div className="fixed bottom-6 right-6 z-[100] group flex flex-col items-end gap-2">
      {/* Botão de Doação Rápida */}
      <span className="bg-white text-secondary text-[10px] font-bold px-3 py-1 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider">
        Quero Apoiar
      </span>
      <button
        className="bg-[#B45045] text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all border-4 border-white"
        onClick={() => window.location.href = '/como-apoiar'}
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

export default DonateButton;