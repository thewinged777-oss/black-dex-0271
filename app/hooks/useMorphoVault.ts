import { useCallback, useEffect, useState } from "react";
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

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

function getProvider(): EthereumProvider | null {
  if (typeof window === "undefined") return null;
  const injected = (window as Window & { ethereum?: EthereumProvider }).ethereum;
  return injected ?? null;
}

function chainFor(vault: MorphoVaultMeta) {
  return vault.chainId === 8453 ? base : mainnet;
}

function rpcFor(vault: MorphoVaultMeta) {
  return vault.chainId === 8453 ? "https://mainnet.base.org" : "https://eth.llamarpc.com";
}

export function useMorphoVault(vault: MorphoVaultMeta) {
  const token = USDC_BY_CHAIN[vault.chain];
  const vaultAddress = vault.address as Address;
  const chain = chainFor(vault);

  const [address, setAddress] = useState<Address | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [assetBalance, setAssetBalance] = useState<bigint>(0n);
  const [allowance, setAllowance] = useState<bigint>(0n);
  const [shares, setShares] = useState<bigint>(0n);
  const [shareAssets, setShareAssets] = useState<bigint>(0n);
  const [busy, setBusy] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const isConnected = Boolean(address);
  const onVault = chainId === vault.chainId;

  const publicClient = createPublicClient({
    chain,
    transport: http(rpcFor(vault)),
  });

  const refreshAccount = useCallback(async () => {
    const provider = getProvider();
    if (!provider) {
      setAddress(null);
      setChainId(null);
      return;
    }
    try {
      const accounts = (await provider.request({ method: "eth_accounts" })) as string[];
      const next = accounts[0] ? (accounts[0] as Address) : null;
      setAddress(next);
      const hex = (await provider.request({ method: "eth_chainId" })) as string;
      setChainId(Number.parseInt(hex, 16));
    } catch {
      setAddress(null);
    }
  }, []);

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
    void refreshAccount();
    const provider = getProvider();
    if (!provider?.on) return;
    const onAccounts = () => void refreshAccount();
    const onChain = () => void refreshAccount();
    provider.on("accountsChanged", onAccounts);
    provider.on("chainChanged", onChain);
    return () => {
      provider.removeListener?.("accountsChanged", onAccounts);
      provider.removeListener?.("chainChanged", onChain);
    };
  }, [refreshAccount]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const connect = useCallback(async () => {
    const provider = getProvider();
    if (!provider) {
      const buttons = Array.from(document.querySelectorAll("button"));
      const header = buttons.find((btn) => /connect/i.test(btn.textContent || ""));
      if (header) {
        header.click();
        return;
      }
      throw new Error("Connect the Black DEX wallet first.");
    }
    const accounts = (await provider.request({
      method: "eth_requestAccounts",
    })) as string[];
    setAddress(accounts[0] ? (accounts[0] as Address) : null);
    const hex = (await provider.request({ method: "eth_chainId" })) as string;
    setChainId(Number.parseInt(hex, 16));
  }, []);

  const ensureChain = useCallback(async (provider: EthereumProvider) => {
    const hexId = `0x${vault.chainId.toString(16)}`;
    try {
      await provider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexId }],
      });
    } catch (err) {
      const code = typeof err === "object" && err && "code" in err ? Number((err as { code: number }).code) : 0;
      if (code !== 4902) throw err;
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: hexId,
            chainName: vault.chain === "base" ? "Base" : "Ethereum",
            nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
            rpcUrls: [rpcFor(vault)],
          },
        ],
      });
    }
    setChainId(vault.chainId);
  }, [vault.chain, vault.chainId]);

  const wallet = useCallback(() => {
    const provider = getProvider();
    if (!provider || !address) throw new Error("Connect the Black DEX wallet first.");
    return {
      provider,
      client: createWalletClient({
        account: address,
        chain,
        transport: custom(provider),
      }),
    };
  }, [address, chain]);

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
      const { provider, client } = wallet();
      setBusy("deposit");
      setStatus(null);
      try {
        await ensureChain(provider);
        if (allowance < amount) {
          setStatus("Approve USDC…");
          const approveHash = await client.writeContract({
            address: token.address,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [vaultAddress, maxUint256],
          });
          await publicClient.waitForTransactionReceipt({ hash: approveHash });
        }
        setStatus("Depositing into Morpho…");
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
    [address, allowance, ensureChain, parseAmount, publicClient, refresh, token.address, vaultAddress, wallet],
  );

  const withdraw = useCallback(
    async (raw: string) => {
      const amount = parseAmount(raw);
      if (amount <= 0n) throw new Error("Amount must be greater than 0.");
      const { provider, client } = wallet();
      setBusy("withdraw");
      setStatus(null);
      try {
        await ensureChain(provider);
        setStatus("Withdrawing from Morpho…");
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
    [address, ensureChain, parseAmount, publicClient, refresh, vaultAddress, wallet],
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
    connect,
    deposit,
    withdraw,
  };
}
