import type { Transaction, Holding } from '../types';
import { INITIAL_TRANSACTIONS, INITIAL_HOLDINGS } from '../data/mockTransactions';
import { getStorageItem, setStorageItem } from '../utils/storage';
import { MockAssetService } from './mockAssetService';
import { MockWalletService } from './mockWalletService';
import { generateSolanaTxSignature } from './solanaAnchorService';

const TRANSACTIONS_STORAGE_KEY = 'assetx_solana_transactions_testnet_v3';
const HOLDINGS_STORAGE_KEY = 'assetx_solana_holdings_testnet_v3';

export interface InvestmentResult {
  success: boolean;
  transaction: Transaction;
  newHolding: Holding;
  error?: string;
}

export class MockInvestmentService {
  private static initTransactions(): Transaction[] {
    const existing = getStorageItem<Transaction[] | null>(TRANSACTIONS_STORAGE_KEY, null);
    if (!existing || existing.length === 0) {
      setStorageItem(TRANSACTIONS_STORAGE_KEY, INITIAL_TRANSACTIONS);
      return INITIAL_TRANSACTIONS;
    }
    return existing;
  }

  private static initHoldings(): Holding[] {
    const existing = getStorageItem<Holding[] | null>(HOLDINGS_STORAGE_KEY, null);
    if (!existing || existing.length === 0) {
      setStorageItem(HOLDINGS_STORAGE_KEY, INITIAL_HOLDINGS);
      return INITIAL_HOLDINGS;
    }
    return existing;
  }

  static getTransactions(): Transaction[] {
    return this.initTransactions();
  }

  static getHoldings(): Holding[] {
    return this.initHoldings();
  }

  static getHoldingForAsset(assetId: string): Holding | undefined {
    return this.getHoldings().find((h) => h.assetId === assetId);
  }

  static executeInvestment(
    assetId: string,
    tokenQuantity: number,
    userAddress: string,
    userEmail: string
  ): InvestmentResult {
    const asset = MockAssetService.getAssetById(assetId);
    if (!asset) {
      throw new Error(`Asset not found: ${assetId}`);
    }

    if (tokenQuantity > asset.availableTokens) {
      throw new Error(`Only ${asset.availableTokens} tokens are available for investment.`);
    }

    const investmentAmount = tokenQuantity * asset.tokenPrice;
    if (investmentAmount < asset.minimumInvestment) {
      throw new Error(`Minimum investment is $${asset.minimumInvestment} (${Math.ceil(asset.minimumInvestment / asset.tokenPrice)} tokens).`);
    }

    const fee = Math.round(investmentAmount * 0.005 * 100) / 100; // 0.5% protocol fee
    const totalAmount = investmentAmount + fee;

    // 1. Update Asset Token Supply in localStorage
    MockAssetService.updateAssetTokens(assetId, tokenQuantity);

    // 2. Generate Solana 64-byte Base58 Transaction Signature
    const signature = generateSolanaTxSignature();
    const currentWallet = MockWalletService.getWallet();

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      txHash: signature,
      signature,
      slot: 280_451_000 + Math.floor(Math.random() * 5000),
      timestamp: new Date().toISOString(),
      assetId,
      assetName: asset.name,
      assetImage: asset.images[0],
      type: 'Purchase',
      tokenQuantity,
      tokenPrice: asset.tokenPrice,
      totalAmount,
      fee,
      feeSOL: 0.000005,
      status: 'Completed',
      userAddress,
      userEmail,
      cluster: currentWallet.cluster || 'testnet',
    };

    const allTx = [newTx, ...this.getTransactions()];
    setStorageItem(TRANSACTIONS_STORAGE_KEY, allTx);

    // 3. Update Holdings
    const holdings = this.getHoldings();
    const existingIndex = holdings.findIndex((h) => h.assetId === assetId);
    let updatedHolding: Holding;

    if (existingIndex >= 0) {
      const existing = holdings[existingIndex];
      const newTotalTokens = existing.tokenQuantity + tokenQuantity;
      const newTotalInvested = existing.totalInvested + investmentAmount;
      const newAvgPrice = Math.round((newTotalInvested / newTotalTokens) * 100) / 100;

      updatedHolding = {
        assetId,
        tokenQuantity: newTotalTokens,
        averagePurchasePrice: newAvgPrice,
        totalInvested: newTotalInvested,
        firstPurchasedAt: existing.firstPurchasedAt,
        lastPurchasedAt: new Date().toISOString(),
      };
      holdings[existingIndex] = updatedHolding;
    } else {
      updatedHolding = {
        assetId,
        tokenQuantity,
        averagePurchasePrice: asset.tokenPrice,
        totalInvested: investmentAmount,
        firstPurchasedAt: new Date().toISOString(),
        lastPurchasedAt: new Date().toISOString(),
      };
      holdings.push(updatedHolding);
    }
    setStorageItem(HOLDINGS_STORAGE_KEY, holdings);

    // 4. Deduct mock wallet balance (USDC + Solana tx fee)
    MockWalletService.deductBalance(totalAmount);

    return {
      success: true,
      transaction: newTx,
      newHolding: updatedHolding,
    };
  }

  static getPortfolioSummary() {
    const holdings = this.getHoldings();
    const assets = MockAssetService.getAssets();

    let totalPortfolioValue = 0;
    let totalInvested = 0;
    let totalTokensHeld = 0;

    const enrichedHoldings = holdings.map((holding) => {
      const asset = assets.find((a) => a.id === holding.assetId);
      const currentPrice = asset ? asset.tokenPrice : holding.averagePurchasePrice;
      const currentValue = holding.tokenQuantity * currentPrice;
      const gainLoss = currentValue - holding.totalInvested;
      const gainLossPercent = holding.totalInvested > 0 ? (gainLoss / holding.totalInvested) * 100 : 0;

      totalPortfolioValue += currentValue;
      totalInvested += holding.totalInvested;
      totalTokensHeld += holding.tokenQuantity;

      return {
        ...holding,
        asset,
        currentValue,
        gainLoss,
        gainLossPercent,
      };
    });

    const netGain = totalPortfolioValue - totalInvested;
    const overallReturnPercent = totalInvested > 0 ? (netGain / totalInvested) * 100 : 0;

    return {
      totalPortfolioValue,
      totalInvested,
      totalAssetsOwned: holdings.length,
      totalTokensHeld,
      netGain,
      overallReturnPercent,
      holdings: enrichedHoldings,
    };
  }
}
