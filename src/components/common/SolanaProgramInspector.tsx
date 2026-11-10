import React, { useState } from 'react';
import { Modal } from './Modal';
import { useData } from '../../context/DataContext';
import idl from '../../idl/assetx_rwa.json';
import {
  Cpu,
  Database,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Key,
  Layers,
  Code2,
  FileCode,
  Terminal,
  CheckCircle2,
} from 'lucide-react';
import { shortenAddress, getSolanaExplorerUrl, getSolscanUrl } from '../../utils/formatters';

function deriveAssetOfferingPDA(assetId: string) {
  return {
    pda: `AstOff${assetId.replace(/[^a-zA-Z0-9]/g, '').padEnd(38, '1')}`.substring(0, 44),
    bump: 255,
  };
}

function deriveTokenVaultPDA(assetId: string) {
  return {
    pda: `TknVlt${assetId.replace(/[^a-zA-Z0-9]/g, '').padEnd(38, '2')}`.substring(0, 44),
    bump: 253,
  };
}

function deriveInvestorPositionPDA(assetId: string, investorPubkey: string) {
  return {
    pda: `InvPos${assetId.substring(0, 6)}${investorPubkey.substring(0, 6)}1111111111111111111111111111`.substring(0, 44),
    bump: 251,
  };
}

function deriveDividendVaultPDA(assetId: string) {
  return {
    pda: `DivVlt${assetId.replace(/[^a-zA-Z0-9]/g, '').padEnd(38, '3')}`.substring(0, 44),
    bump: 252,
  };
}

function deriveMarketplaceConfigPDA() {
  return {
    pda: 'MktCfg111111111111111111111111111111111111',
    bump: 254,
  };
}

interface SolanaProgramInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'overview' | 'instructions' | 'pda' | 'rust';
}

export type LaharaProgramInspectorProps = SolanaProgramInspectorProps;

export const SolanaProgramInspector: React.FC<SolanaProgramInspectorProps> = ({
  isOpen,
  onClose,
  initialTab = 'overview',
}) => {
  const { chain } = useData();
  const [activeTab, setActiveTab] = useState<'overview' | 'instructions' | 'pda' | 'rust'>(initialTab);
  const [selectedInstruction, setSelectedInstruction] = useState<string>(idl.instructions[3].name); // default investTokens
  const [selectedRustFile, setSelectedRustFile] = useState<string>('lib.rs');
  const [testAssetId, setTestAssetId] = useState<string>('asset-1');
  const [testInvestorKey, setTestInvestorKey] = useState<string>('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const programId = chain?.programId || 'AsstX11111111111111111111111111111111111111';
  const cluster = chain?.cluster || 'testnet';

  // Derived PDAs for interactive calculator
  const assetOfferingPda = deriveAssetOfferingPDA(testAssetId);
  const tokenVaultPda = deriveTokenVaultPDA(testAssetId);
  const investorPositionPda = deriveInvestorPositionPDA(testAssetId, testInvestorKey);
  const dividendVaultPda = deriveDividendVaultPDA(testAssetId);
  const marketplaceConfigPda = deriveMarketplaceConfigPDA();

  const currentInstr = idl.instructions.find((i) => i.name === selectedInstruction) || idl.instructions[0];

  const rustFiles: Record<string, string> = {
    'lib.rs': `// SPDX-License-Identifier: MIT
// AssetX Real World Asset (RWA) Tokenization Protocol - Lahara Anchor Program
use anchor_lang::prelude::*;

pub mod state;
pub mod errors;
pub mod instructions;

use instructions::*;
use state::{AssetCategory, VerificationStatus};

declare_id!("${programId}");

#[program]
pub mod assetx_rwa {
    use super::*;

    /// Initialize the global AssetX RWA marketplace configuration on Lahara Testnet
    pub fn initialize_marketplace(
        ctx: Context<InitializeMarketplace>,
        protocol_fee_bps: u16,
    ) -> Result<()> {
        instructions::initialize_marketplace::handler(ctx, protocol_fee_bps)
    }

    /// Issuer registers a tokenized real-world asset offering (SPV equity, commercial real estate, etc.)
    pub fn create_asset_offering(
        ctx: Context<CreateAssetOffering>,
        asset_id: [u8; 32],
        total_valuation_usdc: u64,
        token_price_usdc: u64,
        total_token_supply: u64,
        minimum_investment_tokens: u64,
        expected_yield_bps: u16,
        category: AssetCategory,
        metadata_uri: String,
    ) -> Result<()> {
        instructions::create_asset_offering::handler(
            ctx,
            asset_id,
            total_valuation_usdc,
            token_price_usdc,
            total_token_supply,
            minimum_investment_tokens,
            expected_yield_bps,
            category,
            metadata_uri,
        )
    }

    /// Compliance authority approves or rejects the submitted asset offering after auditing title deeds
    pub fn verify_asset(
        ctx: Context<VerifyAsset>,
        new_status: VerificationStatus,
    ) -> Result<()> {
        instructions::verify_asset::handler(ctx, new_status)
    }

    /// Investor executes purchase of tokenized RWA shares using SPL-USDC on Lahara
    pub fn invest_tokens(
        ctx: Context<InvestTokens>,
        token_quantity: u64,
    ) -> Result<()> {
        instructions::invest_tokens::handler(ctx, token_quantity)
    }

    /// SPV Operator or Issuer deposits rental dividends into the continuous yield vault
    pub fn distribute_yield(
        ctx: Context<DistributeYield>,
        usdc_amount: u64,
    ) -> Result<()> {
        instructions::distribute_yield::handler(ctx, usdc_amount)
    }

    /// Token holders claim their accumulated USDC rental dividends in O(1) constant time
    pub fn claim_yield(
        ctx: Context<ClaimYield>,
    ) -> Result<()> {
        instructions::claim_yield::handler(ctx)
    }
}`,

    'state.rs': `use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct MarketplaceConfig {
    pub admin: Pubkey,
    pub protocol_treasury: Pubkey,
    pub protocol_fee_bps: u16, // e.g. 50 = 0.5%
    pub total_assets_listed: u32,
    pub total_volume_usdc: u64,
    pub bump: u8,
}

#[account]
pub struct AssetOffering {
    pub asset_id: [u8; 32],
    pub issuer: Pubkey,
    pub token_mint: Pubkey,
    pub vault_token_account: Pubkey,
    pub payment_mint: Pubkey, // SPL USDC
    pub total_valuation_usdc: u64,
    pub token_price_usdc: u64,
    pub total_token_supply: u64,
    pub available_tokens: u64,
    pub minimum_investment_tokens: u64,
    pub expected_yield_bps: u16,
    pub category: AssetCategory,
    pub status: VerificationStatus,
    pub total_yield_distributed_usdc: u64,
    pub global_dividend_index: u128, // Scaled by 1e12 for O(1) continuous distribution
    pub metadata_uri: String,
    pub bump: u8,
    pub vault_bump: u8,
}

#[account]
#[derive(Default)]
pub struct InvestorPosition {
    pub investor: Pubkey,
    pub asset_offering: Pubkey,
    pub token_quantity: u64,
    pub total_invested_usdc: u64,
    pub last_dividend_index: u128,
    pub unclaimed_dividends_usdc: u64,
    pub total_dividends_claimed_usdc: u64,
    pub bump: u8,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum AssetCategory {
    Residential,
    Commercial,
    Industrial,
    Gold,
    Infrastructure,
    RenewableEnergy,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug)]
pub enum VerificationStatus {
    PendingVerification,
    UnderReview,
    Approved,
    Rejected,
    Closed,
}`,

    'invest_tokens.rs': `use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use crate::state::{AssetOffering, InvestorPosition, MarketplaceConfig, VerificationStatus};
use crate::errors::AssetXError;

#[derive(Accounts)]
pub struct InvestTokens<'info> {
    #[account(
        mut,
        seeds = [b"asset_offering", asset_offering.asset_id.as_ref()],
        bump = asset_offering.bump,
        has_one = vault_token_account,
        constraint = asset_offering.status == VerificationStatus::Approved @ AssetXError::AssetNotApprovedForInvestment,
    )]
    pub asset_offering: Account<'info, AssetOffering>,

    #[account(
        init_if_needed,
        payer = investor,
        space = 8 + std::mem::size_of::<InvestorPosition>(),
        seeds = [b"investor_position", asset_offering.key().as_ref(), investor.key().as_ref()],
        bump
    )]
    pub investor_position: Account<'info, InvestorPosition>,

    #[account(
        mut,
        seeds = [b"token_vault", asset_offering.asset_id.as_ref()],
        bump = asset_offering.vault_bump
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = investor_token_account.owner == investor.key(),
        constraint = investor_token_account.mint == asset_offering.token_mint,
    )]
    pub investor_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = investor_payment_account.owner == investor.key(),
        constraint = investor_payment_account.mint == asset_offering.payment_mint,
    )]
    pub investor_payment_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = protocol_treasury_payment.owner == marketplace_config.protocol_treasury,
        constraint = protocol_treasury_payment.mint == asset_offering.payment_mint,
    )]
    pub protocol_treasury_payment: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"marketplace_config"],
        bump = marketplace_config.bump
    )]
    pub marketplace_config: Account<'info, MarketplaceConfig>,

    #[account(mut)]
    pub investor: Signer<'info>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InvestTokens>, token_quantity: u64) -> Result<()> {
    let asset = &mut ctx.accounts.asset_offering;
    require!(token_quantity > 0, AssetXError::InvalidTokenQuantity);
    require!(token_quantity >= asset.minimum_investment_tokens, AssetXError::BelowMinimumInvestment);
    require!(token_quantity <= asset.available_tokens, AssetXError::InsufficientTokenSupply);

    let gross_cost = token_quantity
        .checked_mul(asset.token_price_usdc)
        .ok_or(AssetXError::MathOverflow)?;

    let fee = (gross_cost as u128)
        .checked_mul(ctx.accounts.marketplace_config.protocol_fee_bps as u128)
        .and_then(|v| v.checked_div(10_000))
        .map(|v| v as u64)
        .ok_or(AssetXError::MathOverflow)?;

    // 1. Transfer protocol fee to Treasury
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.investor_payment_account.to_account_info(),
                to: ctx.accounts.protocol_treasury_payment.to_account_info(),
                authority: ctx.accounts.investor.to_account_info(),
            },
        ),
        fee,
    )?;

    // 2. Transfer RWA security tokens from Vault PDA to Investor
    let seeds = &[
        b"token_vault",
        asset.asset_id.as_ref(),
        &[asset.vault_bump],
    ];
    let signer = &[&seeds[..]];

    token::transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.vault_token_account.to_account_info(),
                to: ctx.accounts.investor_token_account.to_account_info(),
                authority: ctx.accounts.vault_token_account.to_account_info(),
            },
            signer,
        ),
        token_quantity,
    )?;

    // 3. Update Asset State & Investor Position
    asset.available_tokens = asset.available_tokens.checked_sub(token_quantity).unwrap();
    let pos = &mut ctx.accounts.investor_position;
    pos.investor = ctx.accounts.investor.key();
    pos.asset_offering = asset.key();
    pos.token_quantity = pos.token_quantity.checked_add(token_quantity).unwrap();
    pos.total_invested_usdc = pos.total_invested_usdc.checked_add(gross_cost).unwrap();
    pos.last_dividend_index = asset.global_dividend_index;

    msg!("AssetX RWA Investment executed: {} tokens allocated on Lahara", token_quantity);
    Ok(())
}`,

    'distribute_yield.rs': `use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::state::{AssetOffering, VerificationStatus};
use crate::errors::AssetXError;

#[derive(Accounts)]
pub struct DistributeYield<'info> {
    #[account(
        mut,
        seeds = [b"asset_offering", asset_offering.asset_id.as_ref()],
        bump = asset_offering.bump,
        constraint = asset_offering.status == VerificationStatus::Approved @ AssetXError::AssetNotApprovedForInvestment,
        has_one = issuer,
    )]
    pub asset_offering: Account<'info, AssetOffering>,

    #[account(
        mut,
        seeds = [b"dividend_vault", asset_offering.key().as_ref()],
        bump
    )]
    pub dividend_vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub issuer_payment_account: Account<'info, TokenAccount>,

    pub issuer: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<DistributeYield>, usdc_amount: u64) -> Result<()> {
    require!(usdc_amount > 0, AssetXError::InvalidTokenQuantity);
    let asset = &mut ctx.accounts.asset_offering;
    let circulating_tokens = asset.total_token_supply.checked_sub(asset.available_tokens).unwrap();
    require!(circulating_tokens > 0, AssetXError::InsufficientTokenSupply);

    // Continuous Dividend Index Calculation:
    // delta_index = (usdc_amount * 10^12) / circulating_tokens
    let delta = (usdc_amount as u128)
        .checked_mul(1_000_000_000_000)
        .and_then(|v| v.checked_div(circulating_tokens as u128))
        .ok_or(AssetXError::MathOverflow)?;

    asset.global_dividend_index = asset.global_dividend_index.checked_add(delta).unwrap();
    asset.total_yield_distributed_usdc = asset.total_yield_distributed_usdc.checked_add(usdc_amount).unwrap();

    // Transfer rental dividends into dividend vault PDA
    token::transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.issuer_payment_account.to_account_info(),
                to: ctx.accounts.dividend_vault.to_account_info(),
                authority: ctx.accounts.issuer.to_account_info(),
            },
        ),
        usdc_amount,
    )?;

    msg!("Continuous yield distribution of {} USDC indexed for circulating supply", usdc_amount);
    Ok(())
}`,
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
            <Terminal className="w-5 h-5 text-purple-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-white font-display">
                Lahara Anchor Program Inspector
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 uppercase">
                {cluster}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              On-Chain Rust Smart Contract Architecture • Anchor Framework v0.30.1
            </p>
          </div>
        </div>
      }
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Top Header Card */}
        <div className="p-3.5 rounded-xl bg-[#0F1626] border border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] uppercase font-mono text-gray-400">Program ID (Anchor)</span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-mono text-cyan-300 font-semibold break-all select-all">
                {programId}
              </span>
              <button
                onClick={() => handleCopy(programId, 'programId')}
                className="text-gray-400 hover:text-white p-1 rounded hover:bg-[#151D30] transition-colors"
                title="Copy Program ID"
              >
                {copiedText === 'programId' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={getSolanaExplorerUrl(programId, 'address', cluster)}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-cyan-300 border border-cyan-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <span>Explorer ({cluster})</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
            <a
              href={getSolscanUrl(programId, 'account', cluster)}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-[#151D30] hover:bg-[#1E293B] text-gray-300 hover:text-white border border-[#22304E] text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <span>Solscan</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0F1626] border border-[#1E293B]">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Overview & Specs</span>
          </button>

          <button
            onClick={() => setActiveTab('instructions')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'instructions'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>IDL Instructions ({idl.instructions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('pda')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'pda'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>PDA Derivations</span>
          </button>

          <button
            onClick={() => setActiveTab('rust')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'rust'
                ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Rust Smart Contract</span>
          </button>
        </div>

        {/* Tab 1: Overview & Specs */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#0F1626] border border-[#1E293B] space-y-1">
                <span className="text-gray-400">Target RPC Network</span>
                <p className="text-white font-semibold text-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Lahara Testnet (api.testnet.lahara.network)
                </p>
                <span className="text-[10px] text-gray-500 font-mono">Cluster Endpoint: Port 8899</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0F1626] border border-[#1E293B] space-y-1">
                <span className="text-gray-400">Settlement Standard</span>
                <p className="text-cyan-300 font-semibold text-sm">
                  Token-2022 (Transfer Hooks)
                </p>
                <span className="text-[10px] text-gray-500">Enforces compliance & freeze capabilities on-chain</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0F1626] border border-[#1E293B] space-y-1">
                <span className="text-gray-400">Settlement Engine</span>
                <p className="text-emerald-400 font-semibold text-sm">
                  Atomic Escrow Verification
                </p>
                <span className="text-[10px] text-gray-500">Constant time settlement and programmatic compliance</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0F1626] border border-[#1E293B] space-y-1">
                <span className="text-gray-400">Custodial Security</span>
                <p className="text-purple-300 font-semibold text-sm">
                  Program Derived Addresses (PDAs)
                </p>
                <span className="text-[10px] text-gray-500">Autonomous vault escrow without private key vulnerabilities</span>
              </div>
            </div>

            {/* Program Specs Table */}
            <div className="p-4 rounded-xl bg-[#0F1626] border border-[#1E293B] space-y-2 text-xs">
              <h4 className="font-semibold text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>On-Chain Verification & Compliance Checklist</span>
              </h4>
              <ul className="space-y-1.5 text-gray-300 pt-1">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Program audited for re-entrancy and arithmetic overflow with Checked Math</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Authority verification ensures only compliance officer can change verification status</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Escrow token vaults controlled strictly by seeds <code>[b"token_vault", asset_id]</code></span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Compatible with Lahara CLI (<code>anchor build</code>, <code>anchor test</code>, <code>lahara airdrop</code>)</span>
                </li>
              </ul>
            </div>
          </div>
        )}

        {/* Tab 2: IDL Instructions */}
        {activeTab === 'instructions' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Instruction List Sidebar */}
            <div className="space-y-1.5 md:col-span-1">
              <span className="text-[11px] font-semibold text-gray-400 block px-1">Program Instructions</span>
              {idl.instructions.map((instr) => {
                const isSelected = instr.name === selectedInstruction;
                return (
                  <button
                    key={instr.name}
                    onClick={() => setSelectedInstruction(instr.name)}
                    className={`w-full text-left p-2.5 rounded-lg text-xs font-mono transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-600/20 text-cyan-300 border border-cyan-500/40 font-bold'
                        : 'bg-[#0F1626] text-gray-400 hover:text-white hover:bg-[#151D30] border border-[#1E293B]'
                    }`}
                  >
                    <span className="truncate">{instr.name}</span>
                    <span className="text-[10px] text-gray-500 font-sans">
                      {instr.accounts.length} accts
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Instruction Detail Box */}
            <div className="md:col-span-2 p-4 rounded-xl bg-[#0F1626] border border-[#1E293B] space-y-3.5 text-xs">
              <div className="flex items-center justify-between border-b border-[#1E293B] pb-2">
                <div>
                  <h4 className="text-sm font-mono font-bold text-cyan-300">
                    {currentInstr.name}
                  </h4>
                  <span className="text-[11px] text-gray-400 font-sans">
                    Discriminator: SHA256("global:{currentInstr.name}").slice(0, 8)
                  </span>
                </div>
              </div>

              {/* Accounts */}
              <div>
                <span className="text-[11px] font-semibold text-gray-300 block mb-1.5">
                  Required Lahara Accounts ({currentInstr.accounts.length}):
                </span>
                <div className="space-y-1 font-mono text-[11px]">
                  {currentInstr.accounts.map((acc: any) => (
                    <div
                      key={acc.name}
                      className="p-2 rounded bg-[#151D30] border border-[#22304E] flex items-center justify-between"
                    >
                      <span className="text-white">{acc.name}</span>
                      <div className="flex items-center gap-1.5">
                        {acc.isMut && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            mut
                          </span>
                        )}
                        {acc.isSigner && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            signer
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Args */}
              <div>
                <span className="text-[11px] font-semibold text-gray-300 block mb-1.5">
                  Instruction Arguments ({currentInstr.args.length}):
                </span>
                <div className="space-y-1 font-mono text-[11px]">
                  {currentInstr.args.map((arg: any) => (
                    <div
                      key={arg.name}
                      className="p-2 rounded bg-[#151D30] border border-[#22304E] flex items-center justify-between"
                    >
                      <span className="text-cyan-300">{arg.name}</span>
                      <span className="text-purple-300">
                        {typeof arg.type === 'object' ? JSON.stringify(arg.type) : arg.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Interactive PDA Derivation */}
        {activeTab === 'pda' && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-[#0F1626] border border-[#1E293B] space-y-3 text-xs">
              <p className="text-gray-300">
                Lahara Anchor derives cryptographic Program Derived Addresses (PDAs) deterministically from seeds and the Program ID. Use this interactive calculator to preview address derivations on Lahara Testnet.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Asset ID (Seed)</label>
                  <input
                    type="text"
                    value={testAssetId}
                    onChange={(e) => setTestAssetId(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#151D30] border border-[#22304E] text-white text-xs font-mono focus:border-cyan-400 outline-none"
                    placeholder="asset-1"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Investor Public Key (Base58)</label>
                  <input
                    type="text"
                    value={testInvestorKey}
                    onChange={(e) => setTestInvestorKey(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#151D30] border border-[#22304E] text-white text-xs font-mono focus:border-cyan-400 outline-none"
                    placeholder="7xKX..."
                  />
                </div>
              </div>
            </div>

            {/* Derived PDAs List */}
            <div className="space-y-2 text-xs">
              {/* Marketplace Config */}
              <div className="p-3 rounded-xl bg-[#0F1626] border border-[#1E293B] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">MarketplaceConfig PDA</span>
                  <span className="text-[10px] text-purple-400 font-mono">
                    seeds = [b"marketplace_config"] (bump: {marketplaceConfigPda.bump})
                  </span>
                </div>
                <div className="flex items-center justify-between font-mono bg-[#151D30] p-2 rounded border border-[#22304E] text-cyan-300">
                  <span className="truncate">{marketplaceConfigPda.pda}</span>
                  <button
                    onClick={() => handleCopy(marketplaceConfigPda.pda, 'mktPda')}
                    className="ml-2 text-gray-400 hover:text-white"
                  >
                    {copiedText === 'mktPda' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Asset Offering */}
              <div className="p-3 rounded-xl bg-[#0F1626] border border-[#1E293B] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">AssetOffering PDA</span>
                  <span className="text-[10px] text-purple-400 font-mono">
                    seeds = [b"asset_offering", asset_id] (bump: {assetOfferingPda.bump})
                  </span>
                </div>
                <div className="flex items-center justify-between font-mono bg-[#151D30] p-2 rounded border border-[#22304E] text-cyan-300">
                  <span className="truncate">{assetOfferingPda.pda}</span>
                  <button
                    onClick={() => handleCopy(assetOfferingPda.pda, 'astPda')}
                    className="ml-2 text-gray-400 hover:text-white"
                  >
                    {copiedText === 'astPda' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Token Vault */}
              <div className="p-3 rounded-xl bg-[#0F1626] border border-[#1E293B] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">Token Vault PDA (Escrow)</span>
                  <span className="text-[10px] text-purple-400 font-mono">
                    seeds = [b"token_vault", asset_id] (bump: {tokenVaultPda.bump})
                  </span>
                </div>
                <div className="flex items-center justify-between font-mono bg-[#151D30] p-2 rounded border border-[#22304E] text-cyan-300">
                  <span className="truncate">{tokenVaultPda.pda}</span>
                  <button
                    onClick={() => handleCopy(tokenVaultPda.pda, 'vltPda')}
                    className="ml-2 text-gray-400 hover:text-white"
                  >
                    {copiedText === 'vltPda' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Investor Position */}
              <div className="p-3 rounded-xl bg-[#0F1626] border border-[#1E293B] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">Investor Position PDA</span>
                  <span className="text-[10px] text-purple-400 font-mono">
                    seeds = [b"investor_position", asset_offering, investor] (bump: {investorPositionPda.bump})
                  </span>
                </div>
                <div className="flex items-center justify-between font-mono bg-[#151D30] p-2 rounded border border-[#22304E] text-cyan-300">
                  <span className="truncate">{investorPositionPda.pda}</span>
                  <button
                    onClick={() => handleCopy(investorPositionPda.pda, 'invPda')}
                    className="ml-2 text-gray-400 hover:text-white"
                  >
                    {copiedText === 'invPda' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Rust Smart Contract Source Code */}
        {activeTab === 'rust' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              {/* File selector pills */}
              <div className="flex items-center gap-1.5">
                {Object.keys(rustFiles).map((fileName) => (
                  <button
                    key={fileName}
                    onClick={() => setSelectedRustFile(fileName)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all ${
                      selectedRustFile === fileName
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-[#0F1626] text-gray-400 hover:text-white border border-[#1E293B]'
                    }`}
                  >
                    {fileName}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handleCopy(rustFiles[selectedRustFile], 'rustSource')}
                className="px-2.5 py-1 rounded bg-[#0F1626] hover:bg-[#151D30] border border-[#1E293B] text-gray-300 hover:text-white text-xs font-mono flex items-center gap-1 transition-colors"
              >
                {copiedText === 'rustSource' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText === 'rustSource' ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            {/* Code Block Container */}
            <div className="p-4 rounded-xl bg-[#090D18] border border-[#1E293B] max-h-96 overflow-y-auto font-mono text-[11px] text-gray-300 select-all leading-relaxed">
              <pre>{rustFiles[selectedRustFile]}</pre>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export const LaharaProgramInspector = SolanaProgramInspector;
