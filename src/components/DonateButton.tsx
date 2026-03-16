import { Heart } from "lucide-react";

const DonateButton = () => {
  return (
    <a
      href="#"
      className="btn-donate group flex items-center gap-3 bg-[#e27d3c] hover:bg-[#c96a32] text-white px-7 py-3 rounded-full transition-all duration-300 shadow-lg hover:scale-105"
    >
      <Heart className="w-5 h-5 fill-transparent group-hover:fill-current transition-colors text-white" />
      <span className="font-display text-xs font-bold uppercase tracking-wider whitespace-nowrap">
        Quero Doar
      </span>
    </a>
  );
};

export default DonateButton;