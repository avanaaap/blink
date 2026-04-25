import React, { type ButtonHTMLAttributes, type PropsWithChildren } from "react";

type ButtonVariant = "primary" | "secondary" | "outline";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  PropsWithChildren & {
    variant?: ButtonVariant;
    fullWidth?: boolean;
  };

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-[#4A3B32] text-white hover:bg-[#322822]",
  secondary: "bg-[#D4A574] text-white hover:opacity-90",
  outline: "border-2 border-neutral-300 text-neutral-700 hover:bg-neutral-50",
};

export function Button({
  variant = "primary",
  fullWidth = false,
  className = "",
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={[
        "rounded-full px-8 py-4 transition-colors disabled:cursor-not-allowed disabled:bg-neutral-300",
        variantClasses[variant],
        fullWidth ? "w-full" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </button>
  );
}
