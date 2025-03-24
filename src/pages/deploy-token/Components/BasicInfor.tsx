import * as React from "react";
import { Controller, useFormContext } from "react-hook-form";
import { IconSetting } from "../../../assets/Icons";
import Button from "../../../components/Button";
import Input from "../../../components/Form/Input";
import Switch from "../../../components/Form/Switch";
import TextArea from "../../../components/Form/TextArea";

export interface IBasicInforStepProps {
  listTags: string[];
  setListTags: (value: string[]) => void;
}

export default function BasicInforStep({
  setListTags,
  listTags,
}: IBasicInforStepProps) {
  const [tagValue, setTagValue] = React.useState<string>("");

  const { watch, control, register } = useFormContext();
  const isRevokeMintAuth = React.useMemo(
    () => watch("step1.revokeMintAuth"),
    [watch("step1.revokeMintAuth")]
  );
  const isRevokeFreezeAuth = React.useMemo(
    () => watch("step1.revokeFreezeAuth"),
    [watch("step1.revokeFreezeAuth")]
  );

  return (
    <>
      <div className="flex gap-[23px] mb-6 ">
        <Input
          register={{
            ...register("step1.name", { required: "Required" }),
          }}
          label="Token Name (Max 30)"
          classBox="w-1/2"
          classInput="w-full h-10"
          placeholder="$CGW"
          required
        />

        <Input
          register={{
            ...register("step1.symbol", { required: "Required" }),
          }}
          label="Token Symbol (Max 10)"
          classBox="w-1/2"
          classInput="w-full h-10"
          placeholder="$CGW"
          required
        />
      </div>
      <div className="flex gap-[23px] mb-6 ">
        <Input
          label="Decimals"
          register={{
            ...register("step1.decimal", { required: "Required" }),
          }}
          classBox="w-full"
          classInput="w-full h-10"
          placeholder="e.g 3"
          type="number"
          required
          subCription="Change the number of decimals for your token"
        />
      </div>

      <div className="flex gap-[23px] mb-6 ">
        <Input
          label="Supply"
          register={{
            ...register("step1.supply", { required: "Required" }),
          }}
          classBox="w-full"
          classInput="w-full h-10"
          placeholder="e.g 3"
          type="number"
          required
          subCription="The initial number of available tokens that will be created in your wallet"
        />
      </div>
      <div className="flex gap-[23px] mb-6 ">
        <Input
          register={{ ...register("step1.logoUrl") }}
          label="Logo (Optional)"
          classBox="w-full"
          classInput="w-full h-10"
          placeholder="e.g 3"
          subCription="Add logo for your token"
        />
      </div>

      <div>
        <TextArea
          register={{
            ...register("step1.description"),
          }}
          label="Description (Optional)"
          placeholder="Describe your token’s purpose"
        />
      </div>
      <div className="flex flex-col gap-[16px] mt-6 mb-6">
        <div className="flex gap-[16px] items-center">
          <Input
            label="Tag (Optional)"
            classBox="w-full"
            classInput="w-full h-10"
            onChange={(e) => {
              setTagValue(e.target.value);
            }}
            value={tagValue}
            subCription="Select tags that are most associated with your project - max 3 tags"
          />
          <Button
            variant="primary"
            type="button"
            disabled={tagValue === "" || !tagValue || listTags.length >= 3}
            onClick={() => {
              setListTags([...listTags, tagValue]);
              setTagValue("");
            }}
            size="sm">
            Add
          </Button>
        </div>
        <div className="flex gap-1">
          {listTags.map((item, index) => (
            <p
              key={index}
              className="bg-gray-300 text-black px-[6px] py-[2px] rounded-lg relative">
              {item}
              <span
                onClick={() => {
                  const newList = listTags.filter((i) => item !== i);
                  setListTags(newList);
                }}
                className="absolute top-[-10px] right-0 text-gray-400 cursor-pointer">
                X
              </span>
            </p>
          ))}
        </div>
      </div>
      <div className="flex gap-3">
        <IconSetting />
        <p className="font-bold">Additional settings</p>
      </div>
      <div className="flex flex-col gap-4 mt-4">
        <Controller
          name="step1.revokeMintAuth"
          control={control}
          render={({ field }) => (
            <Switch
              label="Revoke Mint Authority"
              checked={field.value}
              onChange={field.onChange}
            />
          )}
        />
        {isRevokeMintAuth && (
          <Input
            register={{ ...register("step1.walletRevokeMinAuth") }}
            label="Wallet Adress"
            classBox="w-full"
            classInput="w-full h-10"
            placeholder="Wallet Adress"
            subCription="Wallet Adress For Revoke Mint Auth"
            required
          />
        )}
        <Controller
          name="step1.revokeFreezeAuth"
          control={control}
          render={({ field }) => (
            <Switch
              label="Revoke Freeze Authority"
              checked={field.value}
              onChange={field.onChange}
            />
          )}
        />
        {isRevokeFreezeAuth && (
          <Input
            register={{ ...register("step1.walletRevokeFreezeAuthority") }}
            label="Wallet Adress"
            classBox="w-full"
            classInput="w-full h-10"
            placeholder="Wallet Adress"
            subCription="Wallet Adress For Revoke Freeze Authority"
            required
          />
        )}
      </div>
    </>
  );
}
