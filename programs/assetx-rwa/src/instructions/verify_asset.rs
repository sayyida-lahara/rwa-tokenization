use anchor_lang::prelude::*;
use crate::state::{AssetOffering, MarketplaceConfig, VerificationStatus};
use crate::errors::ErrorCode;

#[derive(Accounts)]
pub struct VerifyAsset<'info> {
    #[account(
        seeds = [b"marketplace_config"],
        bump = marketplace_config.bump,
        has_one = admin @ ErrorCode::UnauthorizedAdmin
    )]
    pub marketplace_config: Account<'info, MarketplaceConfig>,

    #[account(
        mut,
        seeds = [b"asset_offering", asset_offering.asset_id.as_ref()],
        bump = asset_offering.bump
    )]
    pub asset_offering: Account<'info, AssetOffering>,

    pub admin: Signer<'info>,
}

pub fn handler(
    ctx: Context<VerifyAsset>,
    new_status: VerificationStatus,
) -> Result<()> {
    let asset = &mut ctx.accounts.asset_offering;
    asset.verification_status = new_status;

    msg!("Asset {:?} verification status updated on Solana.", asset.asset_id);
    Ok(())
}
