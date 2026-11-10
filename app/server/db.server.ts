import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

import { INITIAL_ASSETS } from '../../src/data/mockAssets';
import { INITIAL_USERS } from '../../src/data/mockUsers';
import { INITIAL_HOLDINGS, INITIAL_TRANSACTIONS } from '../../src/data/mockTransactions';
import type {
  MarketplaceSettings,
  SolanaCluster,
  UserPreferences,
  WalletState,
} from '../../src/types';

/** Bump this when the seed shape changes so existing demo databases are refreshed. */
const SEED_VERSION = '2026-11-rwa-sqlite-v1';

export const DEFAULT_WALLET: WalletState = {
  isConnected: true,
  address: '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU',
  balanceUSDC: 145250,
  balanceSOL: 42.5,
  cluster: 'testnet',
  walletType: 'phantom',
};

export const DEFAULT_MARKETPLACE_SETTINGS: MarketplaceSettings = {
  feePercent: 0.5,
  minOfferingValuation: 1_000_000,
  oracleProvider: 'Solana Token-2022 Compliance Oracle',
  settlementNetwork: 'Solana Mainnet Beta',
  isTradingPaused: false,
};

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  emailAlerts: true,
  dividendAlerts: true,
};

export const DEFAULT_WATCHLIST = ['asset-1', 'asset-2', 'asset-6'];

export const SETTLEMENT_NETWORKS = [
  'Solana Mainnet Beta',
  'Solana Devnet',
  'Solana Testnet',
  'Solana Localnet',
] as const;

let db: DatabaseSync | null = null;
let activePath: string | null = null;

function databasePath(): string {
  if (process.env.ASSETX_DB_PATH) return process.env.ASSETX_DB_PATH;
  return path.join(process.cwd(), 'data', 'assetx.sqlite');
}

function createSchema(connection: DatabaseSync): void {
  connection.exec(`
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS key_value (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS assets (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      sort_order INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS holdings (
      asset_id TEXT PRIMARY KEY,
      data TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS watchlist (
      asset_id TEXT PRIMARY KEY,
      added_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS preferences (
      user_id TEXT PRIMARY KEY,
      data TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS newsletter (
      email TEXT PRIMARY KEY,
      subscribed_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_assets_sort ON assets(sort_order);
    CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON transactions(timestamp DESC);
  `);
}

function clearDemoTables(connection: DatabaseSync): void {
  connection.exec(`
    DELETE FROM assets;
    DELETE FROM users;
    DELETE FROM holdings;
    DELETE FROM transactions;
    DELETE FROM watchlist;
    DELETE FROM preferences;
    DELETE FROM newsletter;
    DELETE FROM key_value;
    DELETE FROM meta;
  `);
}

function seedDemoData(connection: DatabaseSync): void {
  const now = new Date().toISOString();

  const insertAsset = connection.prepare(
    'INSERT OR REPLACE INTO assets (id, data, sort_order, created_at) VALUES (?, ?, ?, ?)'
  );
  INITIAL_ASSETS.forEach((asset, index) => {
    insertAsset.run(asset.id, JSON.stringify(asset), index, now);
  });

  const insertUser = connection.prepare(
    'INSERT OR REPLACE INTO users (id, data, sort_order, created_at) VALUES (?, ?, ?, ?)'
  );
  INITIAL_USERS.forEach((user, index) => {
    insertUser.run(user.id, JSON.stringify(user), index, now);
  });

  const insertHolding = connection.prepare(
    'INSERT OR REPLACE INTO holdings (asset_id, data) VALUES (?, ?)'
  );
  INITIAL_HOLDINGS.forEach((holding) => {
    insertHolding.run(holding.assetId, JSON.stringify(holding));
  });

  const insertTransaction = connection.prepare(
    'INSERT OR REPLACE INTO transactions (id, data, timestamp) VALUES (?, ?, ?)'
  );
  INITIAL_TRANSACTIONS.forEach((transaction) => {
    insertTransaction.run(transaction.id, JSON.stringify(transaction), transaction.timestamp);
  });

  const insertWatchlist = connection.prepare(
    'INSERT OR REPLACE INTO watchlist (asset_id, added_at) VALUES (?, ?)'
  );
  DEFAULT_WATCHLIST.forEach((assetId) => insertWatchlist.run(assetId, now));

  const insertPreference = connection.prepare(
    'INSERT OR REPLACE INTO preferences (user_id, data) VALUES (?, ?)'
  );
  INITIAL_USERS.forEach((user) => {
    insertPreference.run(user.id, JSON.stringify(DEFAULT_USER_PREFERENCES));
  });

  const putKeyValue = connection.prepare(
    'INSERT OR REPLACE INTO key_value (key, value) VALUES (?, ?)'
  );
  putKeyValue.run('wallet', JSON.stringify(DEFAULT_WALLET));
  putKeyValue.run('marketplace', JSON.stringify(DEFAULT_MARKETPLACE_SETTINGS));
  putKeyValue.run('currentUser', INITIAL_USERS[0].id);

  const putMeta = connection.prepare('INSERT OR REPLACE INTO meta (key, value) VALUES (?, ?)');
  putMeta.run('seed_version', SEED_VERSION);
  putMeta.run('seeded_at', now);
}

function seedIfNeeded(connection: DatabaseSync): void {
  const row = connection.prepare('SELECT value FROM meta WHERE key = ?').get('seed_version') as
    | { value: string }
    | undefined;

  if (row?.value === SEED_VERSION) return;

  const count = connection.prepare('SELECT COUNT(*) AS count FROM assets').get() as {
    count: number;
  };

  if (row?.value !== SEED_VERSION && count.count > 0) {
    // Schema/seed changed but data exists: migrate by reseeding the demo store.
    clearDemoTables(connection);
  }

  seedDemoData(connection);
}

export function getDb(): DatabaseSync {
  const target = databasePath();
  if (db && activePath === target) return db;

  closeDb();

  if (target !== ':memory:') {
    fs.mkdirSync(path.dirname(target), { recursive: true });
  }

  db = new DatabaseSync(target);
  db.exec('PRAGMA foreign_keys = ON;');
  if (target !== ':memory:') {
    db.exec('PRAGMA journal_mode = WAL;');
  }
  createSchema(db);
  seedIfNeeded(db);
  activePath = target;
  return db;
}

export function closeDb(): void {
  if (db) {
    try {
      db.close();
    } catch {
      // already closed
    }
  }
  db = null;
  activePath = null;
}

/** Reset every demo table back to the seeded sample data. Returns the fresh database handle. */
export function resetDatabase(): DatabaseSync {
  const connection = getDb();
  clearDemoTables(connection);
  seedDemoData(connection);
  return connection;
}

/** Point the process at an isolated SQLite database (used by tests). */
export function useDatabase(target: string): DatabaseSync {
  process.env.ASSETX_DB_PATH = target;
  closeDb();
  return getDb();
}

export function getKeyValue<T>(key: string, fallback: T): T {
  const row = getDb().prepare('SELECT value FROM key_value WHERE key = ?').get(key) as
    | { value: string }
    | undefined;
  if (!row) return fallback;
  try {
    return JSON.parse(row.value) as T;
  } catch {
    return fallback;
  }
}

export function setKeyValue<T>(key: string, value: T): void {
  getDb()
    .prepare('INSERT OR REPLACE INTO key_value (key, value) VALUES (?, ?)')
    .run(key, JSON.stringify(value));
}

export function parseJson<T>(value: string): T {
  return JSON.parse(value) as T;
}

export type { MarketplaceSettings, UserPreferences, SolanaCluster, WalletState };
