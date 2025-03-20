import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import { FC } from "react";

export const Wallet: FC = () => {
  return (
    <div className="w-[180px]">
      <WalletMultiButton />
    </div>
  );
};
