import { useMemo } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { IconDelete } from "../../../assets/Icons";
import Button from "../../../components/Button";
import Input from "../../../components/Form/Input";
import { DEFAULT_ALLOCATION } from "../../../constant";

export default function AllocationStep() {
  const { register, setValue, control } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "step4",
  });

  const watchedItems = useWatch({ control, name: "step4" }) ?? [];

  const handleChange = (index: number, value: number) => {
    setValue(`step4.${index}.share`, value, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const totalPercent = useMemo(() => {
    return watchedItems.reduce((prev: number, next: any) => {
      const percent = Number(next?.share) || 0;
      return prev + percent;
    }, 0);
  }, [watchedItems]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between">
        <p>Token Allocations</p>
        <p>Remaining: {100 - totalPercent}%</p>
      </div>
      <div className="w-full bg-[#0000001A] mt-[19px] h-[1px] mb-8"></div>

      {fields.map((allocateItem, index) => (
        <div
          key={allocateItem.id}
          className="p-3 border border-solid-[#E5E5E5] rounded-lg flex flex-col">
          <div className="flex justify-between">
            <p>Allocation #{index + 1}</p>
            <div onClick={() => remove(index)} className="cursor-pointer">
              <IconDelete />
            </div>
          </div>
          <div className="flex gap-[23px] mb-6">
            <Input
              register={register(`step4.${index}.description`)}
              label="Description (Optional)"
              classBox="w-1/2"
              classInput="w-full h-10"
              placeholder="e.g Team"
            />
            <Input
              register={register(`step4.${index}.share`)}
              label={`Percentage: ${watchedItems?.[index]?.share ?? 0}%`}
              classBox="w-1/2"
              classInput="w-full h-10"
              placeholder="1%"
              type="number"
              onChange={(e) => handleChange(index, Number(e.target.value))}
              required
            />
          </div>
          <div className="flex gap-[23px] mb-6">
            <Input
              register={register(`step4.${index}.address`)}
              label="Wallet Address"
              classBox="w-1/2"
              classInput="w-full h-10"
              placeholder="Solana wallet address"
              required
            />
            <Input
              register={register(`step4.${index}.lockupPeriod`)}
              label="Lockup Period (days)"
              classBox="w-1/2"
              classInput="w-full h-10"
              placeholder="36"
              type="number"
              required
            />
          </div>
        </div>
      ))}

      <Button variant="default" onClick={() => append(DEFAULT_ALLOCATION)}>
        Add Allocate
      </Button>
    </div>
  );
}
