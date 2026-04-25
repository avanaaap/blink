import type { InputHTMLAttributes } from "react";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function FormField({ label, className = "", ...props }: FormFieldProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm text-neutral-700">{label}</span>
      <input
        className={[
          "w-full rounded-lg border border-neutral-300 px-4 py-3 focus:border-black focus:outline-none",
          className,
        ].join(" ")}
        {...props}
      />
    </label>
  );
}
