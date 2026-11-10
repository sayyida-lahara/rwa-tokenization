import { randomBytes } from 'node:crypto';

import type { ChainReceipt, SolanaCluster } from '../../src/types';

const ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

export function bytesToBase58(bytes: Uint8Array): string {
  const digits = [0];
  for (let i = 0; i < bytes.length; i++) {
    let carry = bytes[i];
    for (let j = 0; j < digits.length; j++) {
      carry += digits[j] << 8;
      digits[j] = carry % 58;
      carry = (carry / 58) | 0;
    }
    while (carry > 0) {
      digits.push(carry % 58);
      carry = (carry / 58) | 0;
    }
  }
  let str = '';
  for (let i = 0; i < bytes.length && bytes[i] === 0; i++) {
    str += ALPHABET[0];
  }
  for (let i = digits.length - 1; i >= 0; i--) {
    str += ALPHABET[digits[i]];
  }
  return str;
}

export function generateSolanaTxSignature(): string {
  // A Solana transaction signature is a 64 byte ed25519 signature, base58 encoded.
  return bytesToBase58(randomBytes(64));
}

export function generateSolanaPublicKey(prefix = 'AstX'): string {
  const raw = bytesToBase58(randomBytes(32));
  return `${prefix}${raw.substring(prefix.length, 44)}`;
}

export function getProgramId(): string {
  return process.env.VITE_SOLANA_PROGRAM_ID || process.env.SOLANA_PROGRAM_ID ||
    'AsstX11111111111111111111111111111111111111';
}

export function getCluster(): SolanaCluster {
  const cluster = process.env.VITE_SOLANA_NETWORK || process.env.SOLANA_NETWORK || 'testnet';
  return cluster as SolanaCluster;
}

/**
 * The backend owns every chain interaction. In this phase the operation is
 * simulated here and returned to the frontend with realistic Solana-shaped
 * metadata, exactly as a real Anchor RPC call would.
 */
export function executeMockChainInstruction(
  instruction: string,
  cluster: SolanaCluster = getCluster()
): ChainReceipt {
  const signature = generateSolanaTxSignature();
  return {
    signature,
    slot: 280_451_000 + Math.floor(Math.random() * 50_000),
    confirmationTimeMs: 380,
    cluster,
    programId: getProgramId(),
    instruction,
    finality: 'confirmed',
  };
}

export function deriveAssetOfferingPDA(assetId: string): { pda: string; bump: number } {
  return {
    pda: `AstOff${assetId.replace(/[^a-zA-Z0-9]/g, '').padEnd(38, '1')}`.substring(0, 44),
    bump: 255,
  };
}

export function deriveTokenVaultPDA(assetId: string): { pda: string; bump: number } {
  return {
    pda: `TknVlt${assetId.replace(/[^a-zA-Z0-9]/g, '').padEnd(38, '2')}`.substring(0, 44),
    bump: 253,
  };
}

export function deriveInvestorPositionPDA(
  assetId: string,
  investorPubkey: string
): { pda: string; bump: number } {
  return {
    pda: `InvPos${assetId.substring(0, 6)}${investorPubkey.substring(0, 6)}1111111111111111111111111111`.substring(0, 44),
    bump: 251,
  };
}

export function deriveDividendVaultPDA(assetId: string): { pda: string; bump: number } {
  return {
    pda: `DivVlt${assetId.replace(/[^a-zA-Z0-9]/g, '').padEnd(38, '3')}`.substring(0, 44),
    bump: 252,
  };
}

export function deriveMarketplaceConfigPDA(): { pda: string; bump: number } {
  return {
    pda: 'MktCfg111111111111111111111111111111111111',
    bump: 254,
  };
}

export function getSolanaExplorerUrl(
  item: string,
  type: 'tx' | 'address' = 'tx',
  cluster: SolanaCluster = getCluster()
): string {
  const clusterParam = cluster === 'mainnet-beta' ? '' : `?cluster=${cluster}`;
  const baseUrl = process.env.VITE_SOLANA_EXPLORER_URL || 'https://explorer.solana.com';
  return `${baseUrl}/${type}/${item}${clusterParam}`;
}

export function getSolscanUrl(
  item: string,
  type: 'tx' | 'account' = 'tx',
  cluster: SolanaCluster = getCluster()
): string {
  const clusterParam = cluster === 'mainnet-beta' ? '' : `?cluster=${cluster}`;
  const baseUrl = process.env.VITE_SOLSCAN_URL || 'https://solscan.io';
  return `${baseUrl}/${type}/${item}${clusterParam}`;
}

