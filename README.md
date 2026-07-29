# Staking dApp

**🔗 Live demo: https://staking-dapp-indol.vercel.app** (connect a wallet on Sepolia)

A full-stack DeFi staking interface: a Next.js frontend connected to a
Synthetix-style `StakingRewards` contract deployed and verified on Sepolia.
Stake a token, watch rewards accrue in real time, claim and withdraw.

**Contracts repo:** https://github.com/bardia8184/Blockchain

## Stack

Next.js (App Router) · TypeScript · Tailwind · wagmi · viem

## Features

- **Wallet connection** via injected provider (MetaMask).
- **Approve → stake flow.** The UI detects when the staking contract lacks
  sufficient allowance and shows an Approve step before Stake, so users never
  hit a failed `transferFrom`.
- **Live reward counter.** Earned rewards are re-read from the chain every few
  seconds via a `refetchInterval`, so the balance ticks up in real time.
- **Claim and withdraw**, each confirmed on-chain before the UI updates.
- **Transaction lifecycle handling.** Buttons reflect pending vs. confirming
  state using `useWaitForTransactionReceipt`, so the user always knows whether a
  transaction is signed, mining, or done.
- **Wrong-network detection.** The app reads the wallet's actual chain and, if
  it isn't Sepolia, shows a banner with a one-click switch and disables actions
  until the network is correct. Network changes are picked up automatically via
  a `chainChanged` listener.

## Deployed contracts (Sepolia)

| Contract | Address |
|---|---|
| StakingRewards | `0xB5f0112bd6D3df12A0cbAC473e59C81a65127033` |
| Stake token (STK) | `0x93977317CBE709223e3C9B5064AF831Ff527ED73` |
| Reward token (RWD) | `0xc71432CdACCF034A3352511b581774c14D60CF94` |

All three are verified on Sepolia Etherscan.

## Run locally

```bash
npm install
npm run dev
```

Then connect a wallet on the Sepolia network.