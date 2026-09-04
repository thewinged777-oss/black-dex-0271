import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, useWalletConnector } from "@orderly.network/hooks";
import {
  createPublicClient,
  createWalletClient,
  custom,
  defineChain,
  formatUnits,
  http,
  maxUint256,
  parseUnits,
  type Address,
  type Chain,
} from "viem";
import { base, mainnet } from "viem/chains";
import type { MorphoVaultMeta } from "@/utils/morpho-earn";
import { ERC20_ABI, ERC4626_ABI, USDC_BY_CHAIN } from "@/utils/morpho-tx";
import { openOrderlyWallet } from "@/utils/open-orderly-wallet";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

const tempo = defineChain({
  id: 4217,
  name: "Tempo",
  nativeCurrency: { name: "USD", symbol: "USD", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://rpc.tempo.xyz"] },
  },
  blockExplorers: {
    default: { name: "Tempo Explorer", url: "https://explore.tempo.xyz" },
  },
});

function chainFor(vault: MorphoVaultMeta): Chain {
  if (vault.chainId === 8453) return base;
  if (vault.chainId === 4217) return tempo;
  return mainnet;
}

function rpcFor(vault: MorphoVaultMeta) {
  if (vault.chainId === 8453) return "https://mainnet.base.org";
  if (vault.chainId === 4217) return "https://rpc.tempo.xyz";
  return "https://eth.llamarpc.com";
}

function tokenFor(vault: MorphoVaultMeta) {
  if (vault.assetAddress) {
    return {
      address: vault.assetAddress as Address,
      decimals: vault.assetDecimals ?? 6,
    };
  }
  if (vault.chain === "tempo") return USDC_BY_CHAIN.tempo;
  if (vault.chain === "base") return USDC_BY_CHAIN.base;
  return USDC_BY_CHAIN.ethereum;
}

function asAddress(value: unknown): Address | null {
  if (typeof value !== "string" || !value.startsWith("0x")) return null;
  return value as Address;
}

function getInjected(): EthereumProvider | null {
  if (typeof window === "undefined") return null;
  return (window as Window & { ethereum?: EthereumProvider }).ethereum ?? null;
}

function providerFromWallet(wallet: unknown): EthereumProvider | null {
  if (!wallet || typeof wallet !== "object") return getInjected();
  const row = wallet as {
    provider?: EthereumProvider;
    wallets?: Array<{ provider?: EthereumProvider }>;
  };
  return row.provider ?? row.wallets?.[0]?.provider ?? getInjected();
}

export function useMorphoVault(vault: MorphoVaultMeta) {
  const token = tokenFor(vault);
  const vaultAddress = vault.address as Address;
  const chain = chainFor(vault);
  const { state } = useAccount();
  const connector = useWalletConnector();
  const address = asAddress(state?.address);
  const provider = providerFromWallet(connector.wallet);

  const [assetBalance, setAssetBalance] = useState<bigint>(0n);
  const [allowance, setAllowance] = useState<bigint>(0n);
  const [shares, setShares] = useState<bigint>(0n);
  const [shareAssets, setShareAssets] = useState<bigint>(0n);
  const [busy, setBusy] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const isConnected = Boolean(address);

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
      console.warn("[earn] refresh failed", err);
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
      if (typeof connector.connect === "function") {
        await connector.connect();
        return;
      }
    } catch {
      // fall through to header button
    }
    const opened = await openOrderlyWallet();
    if (!opened) {
      setStatus("Use Connect wallet in the header.");
    }
  }, [address, connector, refresh]);

  const ensureChain = useCallback(async () => {
    const hexId = `0x${vault.chainId.toString(16)}`;
    try {
      if (typeof connector.setChain === "function") {
        await connector.setChain({ chainId: vault.chainId });
        return;
      }
    } catch {
      // Orderly chain list may omit Tempo / Base
    }
    if (!provider) return;
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexId }],
      });
    } catch {
      if (vault.chainId === 4217 || vault.chainId === 8453) {
        try {
          await provider.request({
            method: "wallet_addEthereumChain",
            params: [
              vault.chainId === 4217
                ? {
                    chainId: hexId,
                    chainName: "Tempo",
                    nativeCurrency: { name: "USD", symbol: "USD", decimals: 18 },
                    rpcUrls: ["https://rpc.tempo.xyz"],
                    blockExplorerUrls: ["https://explore.tempo.xyz"],
                  }
                : {
                    chainId: hexId,
                    chainName: "Base",
                    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
                    rpcUrls: ["https://mainnet.base.org"],
                    blockExplorerUrls: ["https://basescan.org"],
                  },
            ],
          });
        } catch {
          // user can add the chain in the wallet UI
        }
      }
    }
  }, [connector, provider, vault.chainId]);

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
          setStatus(`Approve ${vault.asset}\u2026`);
          const approveHash = await client.writeContract({
            address: token.address,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [vaultAddress, maxUint256],
          });
          await publicClient.waitForTransactionReceipt({ hash: approveHash });
        }
        setStatus("Depositing\u2026");
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
    [
      address,
      allowance,
      ensureChain,
      parseAmount,
      publicClient,
      refresh,
      token.address,
      vault.asset,
      vaultAddress,
      walletClient,
    ],
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
        setStatus("Withdrawing\u2026");
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
