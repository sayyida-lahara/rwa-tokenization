use anchor_lang::prelude::*;

pub mod state;
pub mod errors;
pub mod instructions;

use instructions::*;
use state::{AssetCategory, VerificationStatus};

declare_id!("AsstX11111111111111111111111111111111111111");

#[program]
pub mod assetx_rwa {
    use super::*;

    /// Initialize the global AssetX RWA marketplace configuration on Solana
    pub fn initialize_marketplace(
        ctx: Context<InitializeMarketplace>,
        protocol_fee_bps: u16,
    ) -> Result<()> {
        instructions::initialize_marketplace::handler(ctx, protocol_fee_bps)
    }

    /// Issuer registers a tokenized real-world asset offering (SPV equity, gold vault, solar farm)
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

    /// Investor executes fractional token purchase via SPL-USDC with automatic protocol fee deduction
    pub fn invest_tokens(
        ctx: Context<InvestTokens>,
        token_quantity: u64,
    ) -> Result<()> {
        instructions::invest_tokens::handler(ctx, token_quantity)
    }

    /// Issuer distributes operating rental income or energy PPA revenue into the dividend vault
    pub fn distribute_yield(
        ctx: Context<DistributeYield>,
        distribution_amount_usdc: u64,
    ) -> Result<()> {
        instructions::distribute_yield::handler(ctx, distribution_amount_usdc)
    }

    /// Tokenholders claim accrued USDC dividends in O(1) constant time
    pub fn claim_yield(ctx: Context<ClaimYield>) -> Result<()> {
        instructions::claim_yield::handler(ctx)
    }
}
