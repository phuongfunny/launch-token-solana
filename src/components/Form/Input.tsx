type InputTypes = "text" | "email" | "password" | "number";

export interface IInputProps {
  label?: string;
  placeholder?: string;
  name?: string;
  required?: boolean;
  subCription?: string;
  onChange?: (e: any) => void;
  classBox?: string;
  classInput?: string;
  type?: InputTypes;
  register?: any;
  value?: string;
  disabled?: boolean;
}

export default function Input(props: IInputProps) {
  const {
    label,
    required,
    subCription,
    classBox,
    placeholder,
    classInput = "w-1/2",
    type = "text",
    register,
    value,
    onChange,
    disabled,
  } = props;
  return (
    <div className={`flex flex-col items-start gap-2 ${classBox}`}>
      {!!label && (
        <label
          className={
            required
              ? 'text-base text-black after:content-["*"] after:text-red-500 after:ml-1'
              : "text-base text-black"
          }>
          {label}
        </label>
      )}
      <input
        {...register}
        type={type}
        disabled={disabled}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`bg-white border border-gray-500 h-10 px-3 py-[10px] rounded-md ${classInput} disabled:bg-gray-400 disabled:cursor-not-allowed`}
      />
      {subCription && <p className="text-sm text-[#64748B]">{subCription}</p>}
    </div>
  );
}
