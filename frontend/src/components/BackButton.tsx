import { ArrowLeft } from "lucide-react";

type BackButtonProps = {
  onClick: () => void;
  label?: string;
  className?: string;
};

export function BackButton({ onClick, label = "Back", className = "" }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`mb-8 flex items-center gap-2 text-[#4A3B32]/70 hover:text-[#4A3B32] ${className}`}
    >
      <ArrowLeft size={20} />
      {label}
    </button>
  );
}
