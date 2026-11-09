use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use crate::state::{AssetOffering, InvestorPosition, MarketplaceConfig, VerificationStatus};
use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct InvestTokens<'info> {
    #[account(
        mut,
        seeds = [b"marketplace_config"],
        bump = marketplace_config.bump
    )]
    pub marketplace_config: Account<'info, MarketplaceConfig>,

    #[account(
        mut,
        seeds = [b"asset_offering", asset_offering.asset_id.as_ref()],
        bump = asset_offering.bump
    )]
    pub asset_offering: Account<'info, AssetOffering>,

    #[account(
        init_if_needed,
        payer = investor,
        space = InvestorPosition::LEN,
        seeds = [b"investor_position", asset_offering.key().as_ref(), investor.key().as_ref()],
        bump
    )]
    pub investor_position: Account<'info, InvestorPosition>,

    /// Vault holding asset tokens for sale
    #[account(
        mut,
        seeds = [b"token_vault", asset_offering.asset_id.as_ref()],
        bump = asset_offering.vault_bump,
    )]
    pub vault_token_account: Account<'info, TokenAccount>,

    /// Investor's token account receiving the fractional tokens
    #[account(mut)]
    pub investor_token_account: Account<'info, TokenAccount>,

    /// Investor's USDC payment account
    #[account(mut)]
    pub investor_usdc_account: Account<'info, TokenAccount>,

    /// Issuer's USDC account receiving investment proceeds
    #[account(mut)]
    pub issuer_usdc_account: Account<'info, TokenAccount>,

    /// Protocol treasury account receiving the 0.5% protocol fee
    #[account(mut)]
    pub protocol_treasury: Account<'info, TokenAccount>,

    #[account(mut)]
    pub investor: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<InvestTokens>,
    token_quantity: u64,
) -> Result<()> {
    let config = &mut ctx.accounts.marketplace_config;
    require!(!config.is_paused, ErrorCode::MarketplacePaused);

    let asset = &mut ctx.accounts.asset_offering;
    require!(asset.verification_status == VerificationStatus::Approved, ErrorCode::AssetNotApproved);
    require!(token_quantity <= asset.available_tokens, ErrorCode::InsufficientTokenSupply);
    require!(token_quantity >= asset.minimum_investment_tokens, ErrorCode::BelowMinimumInvestment);

    // 1. Calculate amounts (USDC 6 decimals)
    let investment_amount = (token_quantity as u128)
        .checked_mul(asset.token_price_usdc as u128)
        .ok_or(ErrorCode::MathOverflow)? as u64;

    let fee = (investment_amount as u128)
        .checked_mul(config.protocol_fee_bps as u128)
        .ok_or(ErrorCode::MathOverflow)?
        .checked_div(10_000)
        .ok_or(ErrorCode::MathOverflow)? as u64;

    let total_usdc = investment_amount.checked_add(fee).ok_or(ErrorCode::MathOverflow)?;

    // 2. Transfer investment USDC to Issuer
    let cpi_accounts_issuer = Transfer {
        from: ctx.accounts.investor_usdc_account.to_account_info(),
        to: ctx.accounts.issuer_usdc_account.to_account_info(),
        authority: ctx.accounts.investor.to_account_info(),
    };
    token::transfer(
        CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts_issuer),
        investment_amount,
    )?;

    // 3. Transfer Protocol Fee to Protocol Treasury
    if fee > 0 {
        let cpi_accounts_treasury = Transfer {
            from: ctx.accounts.investor_usdc_account.to_account_info(),
            to: ctx.accounts.protocol_treasury.to_account_info(),
            authority: ctx.accounts.investor.to_account_info(),
        };
        token::transfer(
            CpiContext::new(ctx.accounts.token_program.to_account_info(), cpi_accounts_treasury),
            fee,
        )?;
    }

    // 4. Transfer Asset Fractional Tokens from Vault PDA to Investor
    let asset_id_binding = asset.asset_id;
    let seeds = &[
        b"asset_offering",
        asset_id_binding.as_ref(),
        &[asset.bump],
    ];
    let signer = &[&seeds[..]];

    let cpi_accounts_token = Transfer {
        from: ctx.accounts.vault_token_account.to_account_info(),
        to: ctx.accounts.investor_token_account.to_account_info(),
        authority: asset.to_account_info(),
    };
    token::transfer(
        CpiContext::new_with_signer(ctx.accounts.token_program.to_account_info(), cpi_accounts_token, signer),
        token_quantity,
    )?;

    // 5. Update Asset Offering State
    asset.available_tokens = asset.available_tokens.checked_sub(token_quantity).ok_or(ErrorCode::MathOverflow)?;
    config.total_volume_usdc = config.total_volume_usdc.checked_add(total_usdc).ok_or(ErrorCode::MathOverflow)?;

    // 6. Update Investor Position PDA
    let position = &mut ctx.accounts.investor_position;
    position.investor = ctx.accounts.investor.key();
    position.asset_offering = asset.key();
    position.tokens_held = position.tokens_held.checked_add(token_quantity).ok_or(ErrorCode::MathOverflow)?;
    position.total_invested_usdc = position.total_invested_usdc.checked_add(investment_amount).ok_or(ErrorCode::MathOverflow)?;
    position.last_accumulated_yield_index = asset.accumulated_yield_per_token;
    position.bump = ctx.bumps.investor_position;

    msg!("Invested {} tokens in asset {:?}. Total USDC: {}", token_quantity, asset.asset_id, total_usdc);
    Ok(())
}
