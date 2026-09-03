import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, useWalletConnector } from "@orderly.network/hooks";
import {
  createPublicClient,
  createWalletClient,
  custom,
  formatUnits,
  http,
  maxUint256,
  parseUnits,
  type Address,
} from "viem";
import { base, mainnet } from "viem/chains";
import type { MorphoVaultMeta } from "@/utils/morpho-earn";
import { ERC20_ABI, ERC4626_ABI, USDC_BY_CHAIN } from "@/utils/morpho-tx";
import { openOrderlyWallet } from "@/utils/open-orderly-wallet";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

function chainFor(vault: MorphoVaultMeta) {
  return vault.chainId === 8453 ? base : mainnet;
}

function rpcFor(vault: MorphoVaultMeta) {
  return vault.chainId === 8453 ? "https://mainnet.base.org" : "https://eth.llamarpc.com";
}

function asAddress(value: unknown): Address | null {
  if (typeof value !== "string" || !value.startsWith("0x")) return null;
  return value as Address;
}

export function useMorphoVault(vault: MorphoVaultMeta) {
  const token = USDC_BY_CHAIN[vault.chain];
  const vaultAddress = vault.address as Address;
  const chain = chainFor(vault);
  const { state } = useAccount();
  const connector = useWalletConnector();

  const address = useMemo(() => {
    const fromAccount = asAddress(state?.address);
    if (fromAccount) return fromAccount;
    const fromWallet = connector.wallet?.accounts?.[0]?.address;
    return asAddress(fromWallet);
  }, [connector.wallet, state?.address]);

  const provider = (connector.wallet?.provider as EthereumProvider | undefined) ?? null;
  const chainId = Number(connector.connectedChain?.id ?? 0) || null;

  const [assetBalance, setAssetBalance] = useState<bigint>(0n);
  const [allowance, setAllowance] = useState<bigint>(0n);
  const [shares, setShares] = useState<bigint>(0n);
  const [shareAssets, setShareAssets] = useState<bigint>(0n);
  const [busy, setBusy] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const isConnected = Boolean(address);
  const onVault = chainId === vault.chainId;

  const publicClient = useMemo(
    () =>
      createPublicClient({
        chain,
        transport: http(rpcFor(vault)),
      }),
    [chain, vault],
  );

  const refresh = useCallback(async () => {
    if (!address) {
      setAssetBalance(0n);
      setAllowance(0n);
      setShares(0n);
      setShareAssets(0n);
      return;
    }
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

  const connect = useCallback(async () => {
    setStatus(null);
    if (address) {
      await refresh();
      return;
    }
    try {
      await openOrderlyWallet(connector);
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Connect failed.");
    }
  }, [address, connector, refresh]);

  const ensureChain = useCallback(async () => {
    if (Number(connector.connectedChain?.id) === vault.chainId) return;
    await connector.setChain({ chainId: vault.chainId });
  }, [connector, vault.chainId]);

  const walletClient = useCallback(() => {
    if (!provider || !address) {
      throw new Error("Connect the Black DEX wallet first.");
    }
    return createWalletClient({
      account: address,
      chain,
      transport: custom(provider),
    });
  }, [address, chain, provider]);

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
      const amount = parseAmount(raw);
      if (amount <= 0n) throw new Error("Amount must be greater than 0.");
      const client = walletClient();
      setBusy("deposit");
      setStatus(null);
      try {
        await ensureChain();
        if (allowance < amount) {
          setStatus("Approve USDC\u2026");
          const approveHash = await client.writeContract({
            address: token.address,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [vaultAddress, maxUint256],
          });
          await publicClient.waitForTransactionReceipt({ hash: approveHash });
        }
        setStatus("Depositing into Morpho\u2026");
        const hash = await client.writeContract({
          address: vaultAddress,
          abi: ERC4626_ABI,
          functionName: "deposit",
          args: [amount, address as Address],
        });
        await publicClient.waitForTransactionReceipt({ hash });
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
      const amount = parseAmount(raw);
      if (amount <= 0n) throw new Error("Amount must be greater than 0.");
      const client = walletClient();
      setBusy("withdraw");
      setStatus(null);
      try {
        await ensureChain();
        setStatus("Withdrawing from Morpho\u2026");
        const hash = await client.writeContract({
          address: vaultAddress,
          abi: ERC4626_ABI,
          functionName: "withdraw",
          args: [amount, address as Address, address as Address],
        });
        await publicClient.waitForTransactionReceipt({ hash });
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

  return {
    address,
    isConnected,
    onVault,
    shares,
    formattedBalance: formatUnits(assetBalance, token.decimals),
    formattedPosition: formatUnits(shareAssets, token.decimals),
    busy,
    status,
    connecting: Boolean(connector.connecting),
    connect,
    deposit,
    withdraw,
  };
}
