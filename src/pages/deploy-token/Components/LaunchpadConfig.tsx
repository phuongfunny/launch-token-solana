import * as React from "react";
import { useFormContext } from "react-hook-form";
import Input from "../../../components/Form/Input";
import Select from "../../../components/Form/Select";
import { LAUNCHPAD_TYPE_OPTIONS } from "../../../constant";

export interface ILaunchpadConfigStepProps {}

export default function LaunchpadConfigStep(props: ILaunchpadConfigStepProps) {
  const { watch, register } = useFormContext();

  const liquidityPoolPercentage = React.useMemo(
    () => watch("step3.liquidityPoolPercentage"),
    [watch("step3.liquidityPoolPercentage")]
  );

  return (
    <>
      <div className="mt-4 flex flex-col gap-3">
        <p>Launchpad Configuration</p>

        <Select
          register={{ ...register("step3.launchType") }}
          options={LAUNCHPAD_TYPE_OPTIONS}
          label="Launch Type"
          subCription="The type of token sale mechanism to use"
          required
        />

        <div className="flex gap-[23px] mb-6 ">
          <Input
            register={{
              ...register("step3.price", {
                setValueAs: (v) => (v === "" ? undefined : Number(v)),
              }),
            }}
            label="Initial Price(SOL)"
            classBox="w-1/2"
            classInput="w-full h-10"
            placeholder="0.01"
            type="number"
            subCription="Starting Price for token Sale"
            required
          />
          <Input
            register={{
              ...register("step3.maxPrice", {
                setValueAs: (v) => (v === "" ? undefined : Number(v)),
              }),
            }}
            label="Maximum Price (SOL)"
            classBox="w-1/2"
            classInput="w-full h-10"
            placeholder="1"
            type="number"
            subCription="Maximum price for bonding curve or auction"
            required
          />
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-3">
        <p>Liquidity Settings</p>
        <div className="flex gap-[23px] mb-6 ">
          <Input
            register={{
              ...register("step3.targetLiquidity", {
                setValueAs: (v) => (v === "" ? undefined : Number(v)),
              }),
            }}
            label="Liquidity Target (SOL)"
            classBox="w-1/2"
            classInput="w-full h-10"
            placeholder="1"
            type="number"
            subCription="Target amount of SOL to raise for liquidity"
            required
          />
          <Input
            register={{
              ...register("step3.liquidityLockPeriod", {
                setValueAs: (v) => (v === "" ? undefined : Number(v)),
              }),
            }}
            label="Liquidity Lockup Period (days)"
            classBox="w-1/2"
            classInput="w-full h-10"
            placeholder="1"
            type="number"
            subCription="Period during which liquidity cannot be removed"
            required
          />
        </div>
        <div className="relative flex flex-col gap-3 ">
          <p>Liquidity Pool Percentage ({liquidityPoolPercentage}%)</p>
          <input
            type="range"
            min="0"
            max="100"
            step="1"
            {...register("step3.liquidityPoolPercentage", {
              setValueAs: (v) => (v === "" ? undefined : Number(v)),
            })}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
          <div
            className="absolute top-[36px] left-0 h-2 bg-blue-500 rounded-lg"
            style={{ width: `${liquidityPoolPercentage}%` }}></div>
        </div>
      </div>
    </>
  );
}
