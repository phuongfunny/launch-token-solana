import React from "react";

interface RadioProps {
  label: string;
  name: string;
  value: string;
  checked?: boolean;
  onChange?: (value: string) => void;
}

const RadioButton: React.FC<RadioProps> = ({
  label,
  name,
  value,
  checked,
  onChange,
}) => {
  return (
    <label className="flex items-center space-x-2 cursor-pointer">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => onChange?.(value)}
        className="hidden peer"
      />
      <div className="w-5 h-5 border-2 border-blue-500 rounded-full peer-checked:bg-blue-500 peer-checked:border-blue-700 transition" />
      <span className="text-gray-700">{label}</span>
    </label>
  );
};

export default RadioButton;
