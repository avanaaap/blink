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
      className={`mb-8 flex items-center gap-2 text-neutral-600 hover:text-black ${className}`}
    >
      <ArrowLeft size={20} />
      {label}
    </button>
  );
}
