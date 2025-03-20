import {
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  getAssociatedTokenAddress,
  getMinimumBalanceForRentExemptMint,
} from "@solana/spl-token";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { IconArrowRight, IconSetting } from "../../assets/Icons";
import Button from "../../components/Button";
import Input from "../../components/Form/Input";
import Switch from "../../components/Form/Switch";
import TextArea from "../../components/Form/TextArea";
import { Wallet } from "../../components/Wallet";

export interface IDeployTokenPageProps {}

type IFormCreateToken = {
  tokenName: string;
  symbol: string;
  amount: number;
  decimals: number;
};

export default function DeployTokenPage() {
  const [enabled, setEnabled] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const { publicKey, sendTransaction, signTransaction } = useWallet();

  const LIST_STEPS = [
    { title: "Basic info" },
    { title: "Government" },
    { title: "Launchpad" },
    { title: "Allocation" },
  ];

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { connection } = useConnection();

  const onCreateToken = useCallback(
    async (values: IFormCreateToken) => {
      try {
        if (!publicKey || !signTransaction) {
          throw new WalletNotConnectedError();
        }
        const lamports = await getMinimumBalanceForRentExemptMint(connection);
        const mintKeypair = Keypair.generate();
        const tokenATA = await getAssociatedTokenAddress(
          mintKeypair.publicKey,
          publicKey
        );

        const createNewTokenTransaction = new Transaction().add(
          SystemProgram.createAccount({
            fromPubkey: publicKey,
            newAccountPubkey: mintKeypair.publicKey,
            space: MINT_SIZE,
            lamports: lamports,
            programId: TOKEN_PROGRAM_ID,
          }),
          createInitializeMintInstruction(
            mintKeypair.publicKey,
            values.decimals,
            publicKey,
            publicKey,
            TOKEN_PROGRAM_ID
          ),
          createAssociatedTokenAccountInstruction(
            publicKey,
            tokenATA,
            publicKey,
            mintKeypair.publicKey
          ),
          createMintToInstruction(
            mintKeypair.publicKey,
            tokenATA,
            publicKey,
            values.amount * Math.pow(10, values.decimals)
          )
        );

        const result = await sendTransaction(
          createNewTokenTransaction,
          connection,
          { signers: [mintKeypair] }
        );
        console.log("🚀 ~ result:", result);
        if (result) {
          toast.success(`🚀 Created token ${values.tokenName} Successfully!`);
        }
      } catch (error) {
        console.log("🚀 ~ onClick ~ error:", error);
      }
    },
    [publicKey, connection, signTransaction, sendTransaction]
  );

  const onSubmit = (data: any) => {
    console.log(data);
  };

  return (
    <div className="max-w-screen-md px-11 py-14 m-auto">
      <div className="flex flex-col">
        <h1 className="text-center text-4xl text-black font-bold">
          Token Deployer
        </h1>
        <p className="text-center text-base text-[#00000080] mt-[18px] font-[Roboto]">
          Easily create and mint your own SPL Token without coding. <br />
          Customize with metadata, supply, and add logo.
        </p>
        <Button
          onClick={() =>
            onCreateToken({
              tokenName: "SON",
              symbol: "SON",
              decimals: 6,
              amount: 10,
            })
          }>
          Deploy
        </Button>
        <Wallet />
        <div className="flex w-full justify-between mt-8">
          {LIST_STEPS.map((item, index) => (
            <div className="flex gap-[10px]" key={index}>
              <div
                className={`w-6 h-6 ${
                  index === 0 ? "bg-black " : "bg-[#737373]"
                } text-white rounded-[50%] flex justify-center items-center text-sm`}>
                {index + 1}
              </div>
              <p className="text-black">{item.title}</p>
              {index < LIST_STEPS.length - 1 && (
                <IconArrowRight color={index === 0 ? "#020617" : undefined} />
              )}
            </div>
          ))}
        </div>
        <div className="w-full bg-[#0000001A] mt-[19px] h-[1px] mb-8"></div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex gap-[23px] mb-6 ">
            <Input
              register={{ ...register("name", { required: "Required" }) }}
              label="Token Name (Max 30)"
              classBox="w-1/2"
              classInput="w-full h-10"
              placeholder="$CGW"
              required
            />
            <Input
              register={{ ...register("symbol", { required: "Required" }) }}
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
              register={{ ...register("decimal", { required: "Required" }) }}
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
              register={{ ...register("supply", { required: "Required" }) }}
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
              register={{ ...register("logoUrl") }}
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
                ...register("description"),
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
                subCription="Select tags that are most associated with your project - max 3 tags"
              />
              <Button variant="primary" size="sm">
                Add
              </Button>
            </div>
          </div>
          <div className="flex gap-3">
            <IconSetting />
            <p className="font-bold">Additional settings</p>
          </div>
          <div className="flex flex-col gap-4 mt-4">
            <Controller
              name="revokeMintAuth"
              control={control}
              render={({ field }) => (
                <Switch
                  label="Revoke Mint Authority"
                  checked={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              name="revokeFreezeAuth"
              control={control}
              render={({ field }) => (
                <Switch
                  label="Revoke Freeze Authority"
                  checked={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </div>

          <div className="flex w-full justify-center items-center mt-4">
            <Button type="submit">
              Next <IconArrowRight color="#fff" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
