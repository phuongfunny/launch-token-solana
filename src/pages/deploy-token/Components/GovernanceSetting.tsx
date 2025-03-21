import * as React from "react";
import Switch from "../../../components/Form/Switch";
import Input from "../../../components/Form/Input";
import { Controller, useFormContext } from "react-hook-form";

export interface IGovernanceSettingStepProps {}

export default function GovernanceSettingStep(
  props: IGovernanceSettingStepProps
) {
  const {
    control,
    register,
    watch,
    formState: { errors },
  } = useFormContext();

  const governanceSetting = React.useMemo(
    () => watch("governanceSetting"),
    [watch("governanceSetting")]
  );

  return (
    <>
      <div className="mt-4 flex gap-3">
        <p>Governance setting</p>
        <Controller
          name="governanceSetting"
          control={control}
          render={({ field }) => (
            <Switch label="" checked={field.value} onChange={field.onChange} />
          )}
        />
      </div>
      <div className="flex flex-col mt-4">
        <div className="flex gap-[23px] mb-6 ">
          <Input
            register={{
              ...register("step2.votingThreshold", {
                setValueAs: (v) => (v === "" ? undefined : Number(v)),
              }),
            }}
            label="Voting Threshold (%)"
            classBox="w-1/2"
            classInput="w-full h-10"
            placeholder="10"
            required
            disabled={!governanceSetting}
            type="number"
          />
          <Input
            register={{
              ...register("step2.proposalDuration", {
                setValueAs: (v) => (v === "" ? undefined : Number(v)),
              }),
            }}
            label="Proposal Duration (days)"
            classBox="w-1/2"
            classInput="w-full h-10"
            placeholder="2 days"
            disabled={!governanceSetting}
            type="number"
          />
        </div>
        <div className="flex gap-[23px] mb-6 ">
          <Input
            register={{
              ...register("step2.excutionDelay", {
                setValueAs: (v) => (v === "" ? undefined : Number(v)),
              }),
            }}
            type="number"
            label="Execution Delay (days)"
            classBox="w-1/2"
            classInput="w-full h-10"
            placeholder="2 days"
            disabled={!governanceSetting}
          />
          <Input
            register={{
              ...register("step2.minToken", {
                setValueAs: (v) => (v === "" ? undefined : Number(v)),
              }),
            }}
            label="Min Tokens to Create Proposal"
            classBox="w-1/2"
            classInput="w-full h-10"
            placeholder="1"
            type="number"
            disabled={!governanceSetting}
          />
        </div>
      </div>
    </>
  );
}
