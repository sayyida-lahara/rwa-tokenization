use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Marketplace trading is currently paused by admin circuit breaker.")]
    MarketplacePaused,
    #[msg("Signer is not authorized to execute this compliance command.")]
    UnauthorizedAdmin,
    #[msg("Asset is not in Approved status for investment.")]
    AssetNotApproved,
    #[msg("Requested quantity exceeds available tokens.")]
    InsufficientTokenSupply,
    #[msg("Order does not meet the minimum token investment ticket.")]
    BelowMinimumInvestment,
    #[msg("Calculation overflow occurred.")]
    MathOverflow,
    #[msg("No tokens available in position for claiming yield.")]
    ZeroTokensHeld,
    #[msg("No accumulated dividend yield available to claim.")]
    NoYieldToClaim,
    #[msg("Asset metadata URI exceeds allocated capacity.")]
    UriTooLong,
    #[msg("Signer is not the authorized asset sponsor.")]
    UnauthorizedIssuer,
}
