export const STAKING_ADDRESS = "0xB5f0112bd6D3df12A0cbAC473e59C81a65127033" as const;
export const STAKE_TOKEN_ADDRESS = "0x93977317CBE709223e3C9B5064AF831Ff527ED73" as const;
export const REWARD_TOKEN_ADDRESS = "0xc71432CdACCF034A3352511b581774c14D60CF94" as const;

// Minimal ABIs — only the functions the frontend calls.
export const ERC20_ABI = [
  {
    type: "function", name: "balanceOf", stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function", name: "approve", stateMutability: "nonpayable",
    inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }],
    outputs: [{ type: "bool" }],
  },
  {
    type: "function", name: "allowance", stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    type: "function", name: "symbol", stateMutability: "view",
    inputs: [], outputs: [{ type: "string" }],
  },
] as const;

export const STAKING_ABI = [
  {
    type: "function", name: "stake", stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }], outputs: [],
  },
  {
    type: "function", name: "withdraw", stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }], outputs: [],
  },
  {
    type: "function", name: "claimReward", stateMutability: "nonpayable",
    inputs: [], outputs: [],
  },
  {
    type: "function", name: "balanceOf", stateMutability: "view",
    inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }],
  },
  {
    type: "function", name: "earned", stateMutability: "view",
    inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }],
  },
  {
    type: "function", name: "totalStaked", stateMutability: "view",
    inputs: [], outputs: [{ type: "uint256" }],
  },
] as const;