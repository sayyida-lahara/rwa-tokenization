use anchor_lang::prelude::*;
use crate::state::MarketplaceConfig;

#[derive(Accounts)]
pub struct InitializeMarketplace<'info> {
    #[account(
        init,
        payer = admin,
        space = MarketplaceConfig::LEN,
        seeds = [b"marketplace_config"],
        bump
    )]
    pub marketplace_config: Account<'info, MarketplaceConfig>,

    /// CHECK: Protocol treasury account receiving protocol fees
    pub protocol_treasury: UncheckedAccount<'info>,

    #[account(mut)]
    pub admin: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handler(
    ctx: Context<InitializeMarketplace>,
    protocol_fee_bps: u16,
) -> Result<()> {
    let config = &mut ctx.accounts.marketplace_config;
    config.admin = ctx.accounts.admin.key();
    config.protocol_treasury = ctx.accounts.protocol_treasury.key();
    config.protocol_fee_bps = protocol_fee_bps;
    config.total_assets = 0;
    config.total_volume_usdc = 0;
    config.is_paused = false;
    config.bump = ctx.bumps.marketplace_config;

    msg!("AssetX Solana Anchor Marketplace initialized. Admin: {}", config.admin);
    Ok(())
}
