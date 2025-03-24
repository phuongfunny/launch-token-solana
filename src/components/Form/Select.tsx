export interface ISelectProps {
  label?: string;
  placeholder?: string;
  name?: string;
  required?: boolean;
  subCription?: string;
  onChange?: (e: any) => void;
  classBox?: string;
  classInput?: string;
  register?: any;
  value?: string;
  disabled?: boolean;
  options: { label: string; value: string }[];
}

export default function Select(props: ISelectProps) {
  const {
    label,
    required,
    subCription,
    classBox,
    placeholder,
    register,
    value,
    onChange,
    disabled,
    options,
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
      <select
        {...register}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        onChange={onChange}
        className="w-full px-3 py-2 border border-black rounded-md focus:ring focus:ring-blue-300">
        {options.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      {subCription && <p className="text-sm text-[#64748B]">{subCription}</p>}
    </div>
  );
}
