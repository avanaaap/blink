type ToggleSwitchProps = {
  checked: boolean;
  onChange: (next: boolean) => void;
};

export function ToggleSwitch({ checked, onChange }: ToggleSwitchProps) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`h-6 w-12 rounded-full transition-colors ${checked ? "bg-[#4A3B32]" : "bg-neutral-300"}`}
    >
      <div
        className={`h-5 w-5 rounded-full bg-white transition-transform ${checked ? "translate-x-6" : "translate-x-0.5"}`}
      />
    </button>
  );
}
