import { useCallback, useEffect, useState } from "react";
import { useAccount, usePublicClient, useSwitchChain, useWalletClient } from "wagmi";
import { formatUnits, maxUint256, parseUnits } from "viem";
import type { MorphoVaultMeta } from "@/utils/morpho-earn";
import { ERC20_ABI, ERC4626_ABI, USDC_BY_CHAIN } from "@/utils/morpho-tx";

export function useMorphoVault(vault: MorphoVaultMeta) {
  const { address, isConnected, chainId } = useAccount();
  const publicClient = usePublicClient({ chainId: vault.chainId });
  const { data: walletClient } = useWalletClient();
  const { switchChainAsync } = useSwitchChain();

  const token = USDC_BY_CHAIN[vault.chain];
  const vaultAddress = vault.address as `0x${string}`;

  const [assetBalance, setAssetBalance] = useState<bigint>(0n);
  const [allowance, setAllowance] = useState<bigint>(0n);
  const [shares, setShares] = useState<bigint>(0n);
  const [shareAssets, setShareAssets] = useState<bigint>(0n);
  const [busy, setBusy] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const onVault = chainId === vault.chainId;

  const refresh = useCallback(async () => {
    if (!address || !publicClient) return;
    try {
      const [bal, allw, sh] = await Promise.all([
        publicClient.readContract({
          address: token.address,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [address],
        }),
        publicClient.readContract({
          address: token.address,
          abi: ERC20_ABI,
          functionName: "allowance",
          args: [address, vaultAddress],
        }),
        publicClient.readContract({
          address: vaultAddress,
          abi: ERC4626_ABI,
          functionName: "balanceOf",
          args: [address],
        }),
      ]);
      setAssetBalance(bal);
      setAllowance(allw);
      setShares(sh);
      if (sh > 0n) {
        const assets = await publicClient.readContract({
          address: vaultAddress,
          abi: ERC4626_ABI,
          functionName: "convertToAssets",
          args: [sh],
        });
        setShareAssets(assets);
      } else {
        setShareAssets(0n);
      }
    } catch (err) {
      console.warn("[morpho] refresh failed", err);
    }
  }, [address, publicClient, token.address, vaultAddress]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const ensureChain = useCallback(async () => {
    if (chainId === vault.chainId) return;
    if (!switchChainAsync) throw new Error("Switch to the vault network in your wallet.");
    await switchChainAsync({ chainId: vault.chainId });
  }, [chainId, switchChainAsync, vault.chainId]);

  const parseAmount = useCallback(
    (raw: string) => {
      const trimmed = raw.trim();
      if (!trimmed) throw new Error("Enter an amount.");
      return parseUnits(trimmed, token.decimals);
    },
    [token.decimals],
  );

  const deposit = useCallback(
    async (raw: string) => {
      if (!address || !walletClient) throw new Error("Connect the Black DEX wallet first.");
      const amount = parseAmount(raw);
      if (amount <= 0n) throw new Error("Amount must be greater than 0.");
      setBusy("deposit");
      setStatus(null);
      try {
        await ensureChain();
        if (allowance < amount) {
          setStatus("Approve USDC…");
          const approveHash = await walletClient.writeContract({
            address: token.address,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [vaultAddress, maxUint256],
            account: address,
            chain: walletClient.chain,
          });
          await publicClient?.waitForTransactionReceipt({ hash: approveHash });
        }
        setStatus("Depositing into Morpho…");
        const hash = await walletClient.writeContract({
          address: vaultAddress,
          abi: ERC4626_ABI,
          functionName: "deposit",
          args: [amount, address],
          account: address,
          chain: walletClient.chain,
        });
        await publicClient?.waitForTransactionReceipt({ hash });
        setStatus("Deposit confirmed.");
        await refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Deposit failed.";
        setStatus(message);
        throw err;
      } finally {
        setBusy(null);
      }
    },
    [address, allowance, ensureChain, parseAmount, publicClient, refresh, token.address, vaultAddress, walletClient],
  );

  const withdraw = useCallback(
    async (raw: string) => {
      if (!address || !walletClient) throw new Error("Connect the Black DEX wallet first.");
      const amount = parseAmount(raw);
      if (amount <= 0n) throw new Error("Amount must be greater than 0.");
      setBusy("withdraw");
      setStatus(null);
      try {
        await ensureChain();
        setStatus("Withdrawing from Morpho…");
        const hash = await walletClient.writeContract({
          address: vaultAddress,
          abi: ERC4626_ABI,
          functionName: "withdraw",
          args: [amount, address, address],
          account: address,
          chain: walletClient.chain,
        });
        await publicClient?.waitForTransactionReceipt({ hash });
        setStatus("Withdraw confirmed.");
        await refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : "Withdraw failed.";
        setStatus(message);
        throw err;
      } finally {
        setBusy(null);
      }
    },
    [address, ensureChain, parseAmount, publicClient, refresh, vaultAddress, walletClient],
  );

  const redeemAll = useCallback(async () => {
    if (!address || !walletClient) throw new Error("Connect the Black DEX wallet first.");
    if (shares <= 0n) throw new Error("No vault shares to redeem.");
    setBusy("redeem");
    setStatus(null);
    try {
      await ensureChain();
      setStatus("Redeeming vault shares…");
      const hash = await walletClient.writeContract({
        address: vaultAddress,
        abi: ERC4626_ABI,
        functionName: "redeem",
        args: [shares, address, address],
        account: address,
        chain: walletClient.chain,
      });
      await publicClient?.waitForTransactionReceipt({ hash });
      setStatus("Redeem confirmed.");
      await refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Redeem failed.";
      setStatus(message);
      throw err;
    } finally {
      setBusy(null);
    }
  }, [address, ensureChain, publicClient, refresh, shares, vaultAddress, walletClient]);

  return {
    address,
    isConnected,
    onVault,
    assetBalance,
    shareAssets,
    shares,
    allowance,
    decimals: token.decimals,
    formattedBalance: formatUnits(assetBalance, token.decimals),
    formattedPosition: formatUnits(shareAssets, token.decimals),
    busy,
    status,
    deposit,
    withdraw,
    redeemAll,
    refresh,
  };
}
