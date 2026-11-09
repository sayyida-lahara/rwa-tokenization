use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use crate::state::AssetOffering;
use crate::errors::ErrorCode;

const YIELD_PRECISION: u128 = 1_000_000_000_000; // 1e12

#[derive(Accounts)]
pub struct DistributeYield<'info> {
    #[account(
        mut,
        seeds = [b"asset_offering", asset_offering.asset_id.as_ref()],
        bump = asset_offering.bump,
        has_one = issuer @ ErrorCode::UnauthorizedIssuer,
    )]
    pub asset_offering: Account<'info, AssetOffering>,

    /// Issuer's USDC account funding the dividends
    #[account(mut)]
    pub issuer_usdc_account: Account<'info, TokenAccount>,

    /// Vault account holding dividend cash flows
    #[account(
        mut,
        seeds = [b"dividend_vault", asset_offering.key().as_ref()],
        bump,
        token::mint = payment_mint,
        token::authority = asset_offering,
    )]
    pub dividend_vault: Account<'info, TokenAccount>,

    pub payment_mint: Account<'info, Mint>,

    pub issuer: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

pub fn handler(
    ctx: Context<DistributeYield>,
    distribution_amount_usdc: u64,
) -> Result<()> {
    let asset = &mut ctx.accounts.asset_offering;

    // Tokens circulating in hands of investors (sold tokens)
    let circulating_tokens = asset.total_token_supply
        .checked_sub(asset.available_tokens)
        .ok_or(ErrorCode::MathOverflow)?;

    require!(circulating_tokens > 0, ErrorCode::ZeroTokensHeld);

    // 1. Transfer USDC from Issuer to Dividend Vault PDA
    let cpi_accounts = Transfer {
        from: ctx.accounts.issuer_usdc_account.to_account_info(),
        to: ctx.accounts.dividend_vault.to_account_info(),
        authority: ctx.accounts.issuer.to_account_info(),
    };
    token::transfer(
        CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts),
        distribution_amount_usdc,
    )?;

    // 2. Update yield index: (amount * 1e12) / circulating_tokens
    let yield_increment = (distribution_amount_usdc as u128)
        .checked_mul(YIELD_PRECISION)
        .ok_or(ErrorCode::MathOverflow)?
        .checked_div(circulating_tokens as u128)
        .ok_or(ErrorCode::MathOverflow)?;

    asset.accumulated_yield_per_token = asset.accumulated_yield_per_token
        .checked_add(yield_increment)
        .ok_or(ErrorCode::MathOverflow)?;

    asset.total_yield_distributed_usdc = asset.total_yield_distributed_usdc
        .checked_add(distribution_amount_usdc)
        .ok_or(ErrorCode::MathOverflow)?;

    msg!("Distributed {} USDC in dividends for asset {:?}.", distribution_amount_usdc, asset.asset_id);
    Ok(())
}
