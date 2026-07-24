"use client";

import { useState, useEffect } from "react";
import {
  useAccount, useConnect, useDisconnect,
  useReadContract, useWriteContract, useWaitForTransactionReceipt,
  useChainId, useSwitchChain,
} from "wagmi";
import { injected } from "wagmi/connectors";
import { sepolia } from "wagmi/chains";
import { formatEther, parseEther } from "viem";
import {
  STAKING_ADDRESS, STAKING_ABI,
  STAKE_TOKEN_ADDRESS, ERC20_ABI,
} from "@/lib/contracts";

export default function Home() {
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const [amount, setAmount] = useState("");
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const eth = (window as any).ethereum;
    if (!eth?.on) return;
    const reload = () => window.location.reload();
    eth.on("chainChanged", reload);
    return () => eth.removeListener?.("chainChanged", reload);
  }, []);

  const { address, isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();
  const wrongNetwork = isConnected && chainId !== undefined && chainId !== sepolia.id;

  // --- reads ---
  const { data: walletBalance, refetch: refetchWallet } = useReadContract({
    address: STAKE_TOKEN_ADDRESS, abi: ERC20_ABI,
    functionName: "balanceOf", args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: staked, refetch: refetchStaked } = useReadContract({
    address: STAKING_ADDRESS, abi: STAKING_ABI,
    functionName: "balanceOf", args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: earned, refetch: refetchEarned } = useReadContract({
    address: STAKING_ADDRESS, abi: STAKING_ABI,
    functionName: "earned", args: address ? [address] : undefined,
    query: { enabled: !!address, refetchInterval: 3000 },
  });

  const { data: allowance, refetch: refetchAllowance } = useReadContract({
    address: STAKE_TOKEN_ADDRESS, abi: ERC20_ABI,
    functionName: "allowance",
    args: address ? [address, STAKING_ADDRESS] : undefined,
    query: { enabled: !!address },
  });

  // --- writes ---
  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (isSuccess) {
      refetchWallet(); refetchStaked(); refetchEarned(); refetchAllowance();
    }
  }, [isSuccess, refetchWallet, refetchStaked, refetchEarned, refetchAllowance]);

  const needsApproval =
    amount !== "" && allowance !== undefined &&
    parseEther(amount) > (allowance as bigint);

  const handleApprove = () =>
    writeContract({
      address: STAKE_TOKEN_ADDRESS, abi: ERC20_ABI,
      functionName: "approve", args: [STAKING_ADDRESS, parseEther(amount || "0")],
    });

  const handleStake = () =>
    writeContract({
      address: STAKING_ADDRESS, abi: STAKING_ABI,
      functionName: "stake", args: [parseEther(amount || "0")],
    });

  const handleWithdraw = () =>
    writeContract({
      address: STAKING_ADDRESS, abi: STAKING_ABI,
      functionName: "withdraw", args: [parseEther(amount || "0")],
    });

  const handleClaim = () =>
    writeContract({
      address: STAKING_ADDRESS, abi: STAKING_ABI,
      functionName: "claimReward", args: [],
    });

  const busy = isPending || isConfirming || wrongNetwork;

  if (!mounted || !isConnected) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-6">
        <h1 className="text-3xl font-bold">Staking dApp</h1>
        <button
          onClick={() => connect({ connector: injected() })}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
        >
          Connect Wallet
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center py-12 gap-6">
      <div className="w-full max-w-md flex justify-between items-center">
        <h1 className="text-2xl font-bold">Staking dApp</h1>
        <button onClick={() => disconnect()} className="text-sm text-gray-500 underline">
          {address?.slice(0, 6)}...{address?.slice(-4)}
        </button>
      </div>

      {wrongNetwork && (
        <div className="w-full max-w-md p-4 border border-red-300 rounded-lg bg-red-50 flex flex-col gap-2">
          <p className="text-sm text-red-700">
            Wrong network — this dApp runs on Sepolia.
          </p>
          <button
            onClick={() => switchChain({ chainId: sepolia.id })}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Switch to Sepolia
          </button>
        </div>
      )}

      <div className="w-full max-w-md grid grid-cols-2 gap-4">
        <Stat label="Wallet" value={walletBalance} suffix="STK" />
        <Stat label="Staked" value={staked} suffix="STK" />
      </div>

      <div className="w-full max-w-md p-4 border rounded-lg bg-green-50">
        <p className="text-sm text-gray-600">Rewards earned</p>
        <p className="text-3xl font-mono text-green-700">
          {earned !== undefined ? Number(formatEther(earned as bigint)).toFixed(6) : "..."} RWD
        </p>
      </div>

      <div className="w-full max-w-md flex flex-col gap-3 p-4 border rounded-lg">
        <input
          type="text" placeholder="Amount"
          value={amount} onChange={(e) => setAmount(e.target.value)}
          className="border rounded px-3 py-2"
        />
        {needsApproval ? (
          <button onClick={handleApprove} disabled={busy}
            className="px-4 py-2 bg-yellow-600 text-white rounded disabled:opacity-50">
            {busy ? "Confirming..." : "Approve"}
          </button>
        ) : (
          <button onClick={handleStake} disabled={busy || !amount}
            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50">
            {busy ? "Confirming..." : "Stake"}
          </button>
        )}
        <button onClick={handleWithdraw} disabled={busy || !amount}
          className="px-4 py-2 border rounded disabled:opacity-50">
          Withdraw
        </button>
      </div>

      <button onClick={handleClaim} disabled={busy}
        className="w-full max-w-md px-4 py-3 bg-green-600 text-white rounded-lg font-medium disabled:opacity-50">
        {busy ? "Confirming..." : "Claim Rewards"}
      </button>
    </main>
  );
}

function Stat({ label, value, suffix }: { label: string; value: unknown; suffix: string }) {
  return (
    <div className="p-4 border rounded-lg">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="text-xl font-mono">
        {value !== undefined ? Number(formatEther(value as bigint)).toFixed(2) : "..."} {suffix}
      </p>
    </div>
  );
}