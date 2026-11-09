use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use crate::state::{AssetOffering, InvestorPosition};
use crate::errors::ErrorCode;

const YIELD_PRECISION: u128 = 1_000_000_000_000; // 1e12

#[derive(Accounts)]
pub struct ClaimYield<'info> {
    #[account(
        seeds = [b"asset_offering", asset_offering.asset_id.as_ref()],
        bump = asset_offering.bump,
    )]
    pub asset_offering: Account<'info, AssetOffering>,

    #[account(
        mut,
        seeds = [b"investor_position", asset_offering.key().as_ref(), investor.key().as_ref()],
        bump = investor_position.bump,
        has_one = investor,
    )]
    pub investor_position: Account<'info, InvestorPosition>,

    #[account(
        mut,
        seeds = [b"dividend_vault", asset_offering.key().as_ref()],
        bump,
    )]
    pub dividend_vault: Account<'info, TokenAccount>,

    #[account(mut)]
    pub investor_usdc_account: Account<'info, TokenAccount>,

    pub investor: Signer<'info>,
    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<ClaimYield>) -> Result<()> {
    let asset = &ctx.accounts.asset_offering;
    let position = &mut ctx.accounts.investor_position;

    // Calculate accrued dividends since last claim
    let index_diff = asset.accumulated_yield_per_token
        .checked_sub(position.last_accumulated_yield_index)
        .ok_or(ErrorCode::MathOverflow)?;

    let pending_yield = (position.tokens_held as u128)
        .checked_mul(index_diff)
        .ok_or(ErrorCode::MathOverflow)?
        .checked_div(YIELD_PRECISION)
        .ok_or(ErrorCode::MathOverflow)? as u64;

    let total_to_claim = position.unclaimed_yield_usdc
        .checked_add(pending_yield)
        .ok_or(ErrorCode::MathOverflow)?;

    require!(total_to_claim > 0, ErrorCode::NoYieldToClaim);

    // Transfer USDC from Dividend Vault to Investor
    let asset_id_binding = asset.asset_id;
    let seeds = &[
        b"asset_offering",
        asset_id_binding.as_ref(),
        &[asset.bump],
    ];
    let signer = &[&seeds[..]];

    let cpi_accounts = Transfer {
        from: ctx.accounts.dividend_vault.to_account_info(),
        to: ctx.accounts.investor_usdc_account.to_account_info(),
        authority: asset.to_account_info(),
    };
    token::transfer(
        CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), cpi_accounts, signer),
        total_to_claim,
    )?;

    // Update position snapshot
    position.last_accumulated_yield_index = asset.accumulated_yield_per_token;
    position.unclaimed_yield_usdc = 0;
    position.total_yield_claimed_usdc = position.total_yield_claimed_usdc
        .checked_add(total_to_claim)
        .ok_or(ErrorCode::MathOverflow)?;

    msg!("Investor {} claimed {} USDC in dividends.", ctx.accounts.investor.key(), total_to_claim);
    Ok(())
}
