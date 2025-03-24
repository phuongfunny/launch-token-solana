export const DEFAULT_ALLOCATION = {
  description: "",
  percentAllocate: 0,
  walletAddress: "",
  lockupPeriod: 0,
};

export const LIST_STEPS = [
  { title: "Basic info" },
  { title: "Government" },
  { title: "Launchpad" },
  { title: "Allocation" },
];

export const PREFIX_TOKEN = {
  CURVE_CONFIGURATION_SEED: "curve_configuration",
  POOL_SEED_PREFIX: "bonding_curve",
  SOL_VAULT_PREFIX: "liquidity_sol_vault",
  FEE_POOL_SEED_PREFIX: "fee_pool",
  FEE_POOL_VAULT_PREFIX: "fee_pool_vault",
};

export const LAUNCHPAD_TYPE_OPTIONS = [
  {
    label: "Bonding Curve",
    value: "Bonding Curve",
  },
];
