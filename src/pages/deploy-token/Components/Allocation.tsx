import { useFieldArray, useFormContext } from "react-hook-form";
import { IconDelete } from "../../../assets/Icons";
import Input from "../../../components/Form/Input";
import Button from "../../../components/Button";
import { DEFAULT_ALLOCATION } from "../../../constant";

export interface IAllocationStepProps {}

export default function AllocationStep(props: IAllocationStepProps) {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    name: "step4",
  });
  console.log("🚀 ~ AllocationStep ~ fields:", fields);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex justify-between">
        <p>Token Allocations</p>
        <p>Remaining: 70%</p>
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
          <div className="flex gap-[23px] mb-6 ">
            <Input
              register={{
                ...register(`step4.${index}.description`),
              }}
              label="Description ( Optional)"
              classBox="w-1/2"
              classInput="w-full h-10"
              placeholder="e.g Team"
            />
            <Input
              register={{
                ...register(`step4.${index}.percentAllocate`),
              }}
              label="Percentage: 30%"
              classBox="w-1/2"
              classInput="w-full h-10"
              placeholder="1%"
              type="number"
              subCription="Allocated amount"
            />
          </div>
          <div className="flex gap-[23px] mb-6 ">
            <Input
              register={{
                ...register(`step4.${index}.walletAddress`),
              }}
              label="Wallet Address"
              classBox="w-1/2"
              classInput="w-full h-10"
              placeholder="Solana wallet address"
            />
            <Input
              register={{
                ...register(`step4.${index}.lockupPeriod`),
              }}
              label="Lockup Period (days)"
              classBox="w-1/2"
              classInput="w-full h-10"
              placeholder="36"
              type="number"
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
