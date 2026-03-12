import { Heart } from "lucide-react";

const DonateButton = () => {
  return (
    <a href="#" className="btn-donate">
      <Heart className="w-5 h-5 fill-current" />
      <span>QUERO<br/>DOAR</span>
    </a>
  );
};

export default DonateButton;
