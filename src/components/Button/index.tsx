import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "danger" | "default";
  size?: "sm" | "md" | "lg";
  onClick?: (e: any) => void;
  type?: "submit" | "button";
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  onClick,
  type,
  disabled = false,
}) => {
  const base = "rounded-lg font-semibold transition duration-300";

  const variants = {
    default: "text-black border hover:bg-black hover:text-white",
    primary: "bg-blue-500 text-white hover:bg-blue-600",
    secondary: "bg-gray-500 text-white hover:bg-gray-600",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };

  const sizes = {
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} h-10 cursor-pointer flex items-center justify-center disabled:bg-gray-400 disabled:cursor-not-allowed`}
      onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
