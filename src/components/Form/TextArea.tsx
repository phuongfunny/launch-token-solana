export interface ITextAreaProps {
  label?: string;
  placeholder?: string;
  name?: string;
  required?: boolean;
  subCription?: string;
  onChange?: (e: any) => void;
  register?: any;
}

export default function TextArea(props: ITextAreaProps) {
  const { label, required, subCription, placeholder, register } = props;
  return (
    <div className="flex flex-col items-start w-full">
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
      <textarea
        {...register}
        className="min-h-[106px] w-full color-black bg-white border border-gray-500 h-10 px-3 py-[10px] rounded-md"
        placeholder={placeholder}
      />
      {subCription && <p className="text-sm text-[#64748B]">{subCription}</p>}
    </div>
  );
}
