import type { SolanaCluster } from '../types';

/**
 * Type-safe application environment configuration
 * Reads from Vite's import.meta.env on the client, or process.env in Node/Bun tests,
 * with fallbacks to Solana Testnet.
 */

function getEnvVar(key: string, fallback: string): string {
  // Vite client-side
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  // Node / Bun / SSR
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  return fallback;
}

export const ENV = {
  // Application Info
  APP_NAME: getEnvVar('VITE_APP_NAME', 'AssetX'),
  APP_URL: getEnvVar('VITE_APP_URL', 'http://localhost:5173'),

  // Solana Network & Cluster
  SOLANA_NETWORK: getEnvVar('VITE_SOLANA_NETWORK', 'testnet') as SolanaCluster,
  SOLANA_RPC_ENDPOINT: getEnvVar('VITE_SOLANA_RPC_ENDPOINT', 'https://api.testnet.solana.com'),
  
  // Anchor Smart Contract Program ID
  SOLANA_PROGRAM_ID: getEnvVar(
    'VITE_SOLANA_PROGRAM_ID',
    'AsstX11111111111111111111111111111111111111'
  ),

  // SPL USDC Payment Mints across clusters
  SPL_USDC_MINT_TESTNET: getEnvVar(
    'VITE_SPL_USDC_MINT_TESTNET',
    'CpMah1WCS2zgGNfrnvPsqApdHcDqmDZTK5e2EHzNxChQ'
  ),
  SPL_USDC_MINT_DEVNET: getEnvVar(
    'VITE_SPL_USDC_MINT_DEVNET',
    '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'
  ),
  SPL_USDC_MINT_MAINNET: getEnvVar(
    'VITE_SPL_USDC_MINT_MAINNET',
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
  ),

  // Explorers
  SOLANA_EXPLORER_URL: getEnvVar('VITE_SOLANA_EXPLORER_URL', 'https://explorer.solana.com'),
  SOLSCAN_URL: getEnvVar('VITE_SOLSCAN_URL', 'https://solscan.io'),

  // Feature Flags
  ENABLE_ANCHOR_INSPECTOR: getEnvVar('VITE_ENABLE_ANCHOR_INSPECTOR', 'true') === 'true',
};
