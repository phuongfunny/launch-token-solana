import {
  AuthorityType,
  MINT_SIZE,
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  createMintToInstruction,
  createSetAuthorityInstruction,
  getAssociatedTokenAddress,
  getMinimumBalanceForRentExemptMint,
} from "@solana/spl-token";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { useCallback, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { IconArrowRight, IconSetting } from "../../assets/Icons";
import Button from "../../components/Button";
import Input from "../../components/Form/Input";
import Switch from "../../components/Form/Switch";
import TextArea from "../../components/Form/TextArea";
import { Wallet } from "../../components/Wallet";
import { findMintMetadataId } from "@solana-nft-programs/common";
import { createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import BasicInforStep from "./Components/BasicInfor";
import GovernanceSettingStep from "./Components/GovernanceSetting";
import LaunchpadConfigStep from "./Components/LaunchpadConfig";
import AllocationStep from "./Components/Allocation";
import { DEFAULT_ALLOCATION } from "../../constant";

export interface IDeployTokenPageProps {}

type IFormCreateToken = {
  tokenName: string;
  symbol: string;
  supply: number;
  decimals: number;
  logoUrl?: string;
  description?: string;
  tags?: string[];
  revokeMintAuth?: boolean;
  revokeFreezeAuth?: boolean;
};

const schema = yup.object().shape({
  step1: yup.object({
    name: yup.string().required("Name is required"),
    symbol: yup.string().required("Symbol is required"),
    decimal: yup.number().required("Decimal is required"),
    supply: yup.number().required("Supply is required"),
    logoUrl: yup.string(),
    description: yup.string(),
    revokeMintAuth: yup.boolean().required(),
    revokeFreezeAuth: yup.boolean().required(),
  }),
  step2: yup.object({
    governanceSetting: yup.boolean(),
    votingThreshold: yup
      .number()
      .when("governanceSetting", (governanceSetting, schema) => {
        return governanceSetting?.[0]
          ? schema.required("This field is required")
          : schema.nullable().notRequired();
      }),
    proposalDuration: yup.number().nullable().notRequired(),
    excutionDelay: yup.number().nullable().notRequired(),
    minToken: yup.number().nullable().notRequired(),
  }),
  step3: yup.object({
    launchType: yup.string(),
    price: yup.number().nullable().notRequired(),
    maxPrice: yup.number().nullable().notRequired(),
    targetAmount: yup.number().nullable().notRequired(),
    periodDuring: yup.number().nullable().notRequired(),
    liqPool: yup.number().nullable().notRequired(),
  }),
  step4: yup.array().of(
    yup.object().shape({
      description: yup.string(),
      percentAllocate: yup.number(),
      walletAddress: yup.string(),
      lockupPeriod: yup.number(),
    })
  ),
});

export default function DeployTokenPage() {
  const [tagValue, setTagValue] = useState<string>("");
  const [listTags, setListTags] = useState<string[]>([]);
  const [step, setStep] = useState(1);

  const { publicKey, sendTransaction, signTransaction } = useWallet();

  const LIST_STEPS = [
    { title: "Basic info" },
    { title: "Government" },
    { title: "Launchpad" },
    { title: "Allocation" },
  ];

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      step1: {
        revokeMintAuth: false,
        revokeFreezeAuth: false,
      },
      step2: {
        governanceSetting: false,
      },
      step3: {
        liqPool: 0,
      },
      step4: [DEFAULT_ALLOCATION],
    },
  });
  const { connection } = useConnection();
  console.log(methods.formState.errors);

  const onNext = async () => {
    const isValid = await methods.trigger(`step${step}` as any);
    console.log("🚀 ~ onNext ~ isValid:", isValid);
    if (!isValid) return;
    setStep((prev) => prev + 1);
  };
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
        const mintMetadataId = findMintMetadataId(mintKeypair.publicKey);

        const metadataIx = createCreateMetadataAccountV3Instruction(
          {
            metadata: mintMetadataId,
            updateAuthority: publicKey,
            mint: mintKeypair.publicKey,
            mintAuthority: publicKey,
            payer: publicKey,
          },
          {
            createMetadataAccountArgsV3: {
              data: {
                name: values.tokenName,
                symbol: values.symbol,
                uri: "https://cdn.paws.community/token/token.json",
                sellerFeeBasisPoints: 0,
                creators: null,
                collection: null,
                uses: null,
              },
              isMutable: true,
              collectionDetails: null,
            },
          }
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
            values.supply * Math.pow(10, values.decimals)
          ),
          metadataIx
        );

        if (values.revokeMintAuth) {
          createNewTokenTransaction.add(
            createSetAuthorityInstruction(
              mintKeypair.publicKey,
              publicKey,
              AuthorityType.MintTokens,
              null
            )
          );
        }
        if (values.revokeFreezeAuth) {
          createNewTokenTransaction.add(
            createSetAuthorityInstruction(
              mintKeypair.publicKey,
              publicKey,
              AuthorityType.FreezeAccount,
              null
            )
          );
        }

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
    const tokenData: IFormCreateToken = {
      tokenName: data.name,
      symbol: data.symbol,
      decimals: Number(data.decimal),
      supply: Number(data.supply),
      revokeMintAuth: data.revokeMintAuth,
      revokeFreezeAuth: data.revokeFreezeAuth,
    };
    console.log(tokenData);
    onCreateToken(tokenData);
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
        <Wallet />
        <div className="flex w-full justify-between mt-8">
          {LIST_STEPS.map((item, index) => (
            <div className="flex gap-[10px]" key={index}>
              <div
                className={`w-6 h-6 ${
                  index + 1 <= step ? "bg-black " : "bg-[#737373]"
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
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            {step === 1 && (
              <BasicInforStep setListTags={setListTags} listTags={listTags} />
            )}
            {step === 2 && <GovernanceSettingStep />}
            {step === 3 && <LaunchpadConfigStep />}
            {step === 4 && <AllocationStep />}
            <div className="flex w-full justify-between items-center mt-4">
              {step > 1 && (
                <Button type="button" onClick={() => setStep(step - 1)}>
                  Back
                </Button>
              )}
              {step < 5 ? (
                <Button
                  type="button"
                  disabled={Object.keys(methods.formState.errors).length !== 0}
                  onClick={onNext}>
                  Next
                </Button>
              ) : (
                <Button type="submit">Deploy Token</Button>
              )}
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
