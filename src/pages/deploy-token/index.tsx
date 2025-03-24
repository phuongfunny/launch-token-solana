import { Idl } from "@coral-xyz/anchor";
import { yupResolver } from "@hookform/resolvers/yup";
import { createCreateMetadataAccountV3Instruction } from "@metaplex-foundation/mpl-token-metadata";
import { findMintMetadataId } from "@solana-nft-programs/common";
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
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Keypair,
  PublicKey,
  SYSVAR_RENT_PUBKEY,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { BN } from "bn.js";
import { useCallback, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as yup from "yup";
import { IconArrowRight } from "../../assets/Icons";
import Button from "../../components/Button";
import { Wallet } from "../../components/Wallet";
import { DEFAULT_ALLOCATION, LIST_STEPS } from "../../constant";
import idlBondingCurve from "../../contracts/IDLs/bonding_curve.json";
import useAnchorProvider from "../../hooks/useAnchorProvider";
import { getPDAs } from "../../utils";
import AllocationStep from "./Components/Allocation";
import BasicInforStep from "./Components/BasicInfor";
import GovernanceSettingStep from "./Components/GovernanceSetting";
import LaunchpadConfigStep from "./Components/LaunchpadConfig";

export type BondingCurve = Idl & typeof idlBondingCurve;

export interface IDeployTokenPageProps {}

type IFormCreateToken = {
  tokenName: string;
  symbol: string;
  supply: number;
  decimals: number;
  image?: string;
  description?: string;
  tags?: string[];
  revokeMintAuth?: boolean;
  revokeFreezeAuth?: boolean;
  walletRevokeMinAuth?: string;
  walletRevokeFreezeAuthority?: string;
};

type IRecepient = {
  description?: string;
  share: number;
  address: string;
  lockupPeriod: number;
};

type IInitialCurveConfig = {
  targetLiquidity: number;
  liquidityLockPeriod: number;
  liquidityPoolPercentage: number;
  recepitients: IRecepient[];
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
    walletRevokeMinAuth: yup
      .string()
      .when("revokeMintAuth", (revokeMintAuth, schema) => {
        return revokeMintAuth?.[0]
          ? schema.required("This field is required")
          : schema;
      }),
    walletRevokeFreezeAuthority: yup
      .string()
      .when("revokeFreezeAuth", (revokeFreezeAuth, schema) => {
        return revokeFreezeAuth?.[0]
          ? schema.required("This field is required")
          : schema.nullable().notRequired();
      }),
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
    launchType: yup.string().required(),
    price: yup.number().required(),
    maxPrice: yup.number().required(),
    targetLiquidity: yup.number().required(),
    liquidityLockPeriod: yup.number().required(),
    liquidityPoolPercentage: yup.number().required(),
  }),
  step4: yup.array().of(
    yup.object().shape({
      description: yup.string(),
      share: yup.number().required(),
      address: yup.string().required(),
      lockupPeriod: yup.number().required(),
    })
  ),
});

export type FormData = yup.InferType<typeof schema>;

export default function DeployTokenPage() {
  const [listTags, setListTags] = useState<string[]>([]);
  const [step, setStep] = useState(1);
  const walletSol = useWallet();
  const { publicKey, sendTransaction, signTransaction } = walletSol;
  const { anchorWallet, program, governanceKeypair, connection, mintKeypair } =
    useAnchorProvider();

  const methods = useForm<FormData>({
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
        liquidityPoolPercentage: 0,
      },
      step4: [DEFAULT_ALLOCATION],
    },
  });

  const feeRecipient3 = Keypair.generate();

  const onLaunchToken = (
    data: IInitialCurveConfig,
    feePool: PublicKey,
    curveConfig: PublicKey
  ) => {
    if (!anchorWallet?.publicKey || !publicKey) {
      toast.error("⚠️ Wallet is not ready! Please connect wallet.");
      return;
    }
    const feePercentage = new BN(100);
    const initialQuorum = new BN(500);
    const daoQuorum = new BN(500);
    const bondingCurveType = 1;
    const maxTokenSupply = new BN(10000000000);

    const recipients = data.recepitients.map((item) => ({
      share: item.share * 100,
      address: feeRecipient3.publicKey,
      lockingPeriod: new BN(item.lockupPeriod),
      amount: new BN(0),
    }));

    // let recipients = [
    //   {
    //     address: feeRecipient3.publicKey,
    //     share: 10000, //percent * 100
    //     amount: new BN(0),
    //     lockingPeriod: new BN(60000),
    //   },
    // ];

    return (
      program.methods
        // @ts-ignore
        .initialize(
          initialQuorum,
          feePercentage,
          new BN(data.targetLiquidity),
          governanceKeypair.publicKey,
          daoQuorum,
          bondingCurveType,
          maxTokenSupply,
          new BN(data.liquidityLockPeriod),
          new BN(data.liquidityPoolPercentage),
          recipients
        )
        .accounts({
          // @ts-ignore
          configurationAccount: curveConfig,
          admin: publicKey,
          tokenMint: mintKeypair.publicKey,
          feePoolAccount: feePool,
          rent: SYSVAR_RENT_PUBKEY,
          systemProgram: SystemProgram.programId,
        })
        .signers([walletSol as any])
        .instruction()
    );
  };

  const onCreateToken = useCallback(
    async (values: IFormCreateToken, initCurveConfig: IInitialCurveConfig) => {
      try {
        if (!anchorWallet?.publicKey || !publicKey || !signTransaction) {
          toast.error("⚠️ Wallet is not ready!");
          return;
        }

        const lamports = await getMinimumBalanceForRentExemptMint(connection);
        const tokenATA = await getAssociatedTokenAddress(
          mintKeypair.publicKey,
          publicKey
        );

        const { curveConfig, feePool } = await getPDAs(
          anchorWallet?.publicKey,
          mintKeypair.publicKey,
          program
        );

        const accountInfo = await connection.getAccountInfo(curveConfig);
        if (accountInfo !== null) {
          toast.error(
            "⚠️ Configuration account already exists, skipping initialization!"
          );
          return;
        }
        const mintMetadataId = findMintMetadataId(mintKeypair.publicKey);

        const metadataInstruction = createCreateMetadataAccountV3Instruction(
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

        const curveConfigIns = await onLaunchToken(
          initCurveConfig,
          feePool,
          curveConfig
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
          metadataInstruction
        );

        if (values.revokeMintAuth && values.walletRevokeMinAuth) {
          createNewTokenTransaction.add(
            createSetAuthorityInstruction(
              mintKeypair.publicKey,
              publicKey,
              AuthorityType.MintTokens,
              new PublicKey(values.walletRevokeMinAuth)
            )
          );
        }
        if (values.revokeFreezeAuth && values.walletRevokeFreezeAuthority) {
          createNewTokenTransaction.add(
            createSetAuthorityInstruction(
              mintKeypair.publicKey,
              publicKey,
              AuthorityType.FreezeAccount,
              new PublicKey(values.walletRevokeFreezeAuthority)
            )
          );
        }

        createNewTokenTransaction.add(curveConfigIns as TransactionInstruction);

        const result = await sendTransaction(
          createNewTokenTransaction,
          connection,
          { signers: [mintKeypair] }
        );
        console.log("🚀 ~ result:", result);
        toast.success(`🚀 Created token ${values.tokenName} Successfully!`);
      } catch (error) {
        toast.error(`Create token failed!`);
        console.error("🚀 ~ onClick ~ error:", error);
      }
    },
    [publicKey, connection, signTransaction, sendTransaction]
  );

  const onSubmit = async (data: FormData) => {
    const totalPercentAllocation =
      data.step4?.reduce((prev, next) => prev + +next.share, 0) ?? 0;

    if (totalPercentAllocation !== 100) {
      toast.error("The total allocation percentage must be equal to 100!");
      return;
    }
    try {
      const tokenData: IFormCreateToken = {
        tokenName: data.step1.name,
        symbol: data.step1.symbol,
        decimals: Number(data.step1.decimal),
        supply: Number(data.step1.supply),
        revokeMintAuth: data.step1.revokeMintAuth,
        revokeFreezeAuth: data.step1.revokeFreezeAuth,
        walletRevokeFreezeAuthority: data.step1.walletRevokeFreezeAuthority,
        walletRevokeMinAuth: data.step1.walletRevokeMinAuth,
      };
      const inforInit: IInitialCurveConfig = {
        ...data.step3,
        recepitients: data.step4 ?? [],
      };
      await onCreateToken(tokenData, inforInit);
    } catch (error) {}
  };

  const onNext = async (e: any) => {
    e.preventDefault();
    const isValid = await methods.trigger(`step${step}` as any);
    if (!isValid) {
      toast.error(`Please check validation fields!`);
      return;
    }
    setStep((prev) => prev + 1);
  };

  return (
    <div className="max-w-screen-md px-11 py-14 m-auto">
      <Wallet />
      <div className="flex flex-col">
        <h1 className="text-center text-4xl text-black font-bold">
          Token Deployer
        </h1>
        <p className="text-center text-base text-[#00000080] mt-[18px] font-[Roboto]">
          Easily create and mint your own SPL Token without coding. <br />
          Customize with metadata, supply, and add logo.
        </p>

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
                <Button
                  type="button"
                  variant="default"
                  onClick={() => setStep(step - 1)}>
                  Back
                </Button>
              )}
              {step < 4 ? (
                <Button type="button" onClick={(e: any) => onNext(e)}>
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
