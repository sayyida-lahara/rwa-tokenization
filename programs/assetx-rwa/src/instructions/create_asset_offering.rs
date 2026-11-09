use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use crate::state::{AssetCategory, AssetOffering, MarketplaceConfig, VerificationStatus};
use crate::errors::ErrorCode;

#[derive(Accounts)]
#[instruction(asset_id: [u8; 32])]
pub struct CreateAssetOffering<'info> {
    #[account(
        mut,
        seeds = [b"marketplace_config"],
        bump = marketplace_config.bump
    )]
    pub marketplace_config: Account<'info, MarketplaceConfig>,

    #[account(
        init,
        payer = issuer,
        space = AssetOffering::LEN,
        seeds = [b"asset_offering", asset_id.as_ref()],
        bump
    )]
    pub asset_offering: Account<'info, AssetOffering>,

    /// The fractional SPL Token Mint representing the asset
    pub token_mint: Account<'info, Mint>,

    /// PDA Token Account that stores tokens available for investment
    #[account(
        init,
        payer = issuer,
        seeds = [b"token_vault", asset_id.as_ref()],
        bump,
        token::mint = token_mint,
        token::authority = asset_offering,
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    /// Currency mint (e.g. SPL USDC)
    pub payment_mint: Account<'info, Mint>,

    #[account(mut)]
    pub issuer: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
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
    require!(metadata_uri.len() <= AssetOffering::MAX_URI_LEN, ErrorCode::UriTooLong);

    let asset = &mut ctx.accounts.asset_offering;
    asset.asset_id = asset_id;
    asset.issuer = ctx.accounts.issuer.key();
    asset.token_mint = ctx.accounts.token_mint.key();
    asset.vault_token_account = ctx.accounts.vault_token_account.key();
    asset.payment_mint = ctx.accounts.payment_mint.key();
    asset.total_valuation_usdc = total_valuation_usdc;
    asset.token_price_usdc = token_price_usdc;
    asset.total_token_supply = total_token_supply;
    asset.available_tokens = total_token_supply;
    asset.minimum_investment_tokens = minimum_investment_tokens;
    asset.expected_yield_bps = expected_yield_bps;
    asset.category = category;
    asset.verification_status = VerificationStatus::PendingVerification;
    asset.metadata_uri = metadata_uri;
    asset.accumulated_yield_per_token = 0;
    asset.total_yield_distributed_usdc = 0;
    asset.listing_timestamp = Clock::get()?.unix_timestamp;
    asset.bump = ctx.bumps.asset_offering;
    asset.vault_bump = ctx.bumps.vault_token_account;

    let config = &mut ctx.accounts.marketplace_config;
    config.total_assets = config.total_assets.checked_add(1).ok_or(ErrorCode::MathOverflow)?;

    msg!("Asset offering created with ID: {:?}. Status: Pending Verification", asset_id);
    Ok(())
}
