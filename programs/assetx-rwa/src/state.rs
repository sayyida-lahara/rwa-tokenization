use anchor_lang::prelude::*;

#[account]
#[derive(Default)]
pub struct MarketplaceConfig {
    /// Authority who can verify assets, adjust fees, or pause trading
    pub admin: Pubkey,
    /// Protocol treasury token account receiving the 0.5% protocol fee
    pub protocol_treasury: Pubkey,
    /// Protocol fee in basis points (50 bps = 0.5%)
    pub protocol_fee_bps: u16,
    /// Counter of tokenized real-world assets
    pub total_assets: u64,
    /// Total cumulative investment volume in USDC (6 decimals)
    pub total_volume_usdc: u64,
    /// Emergency circuit breaker
    pub is_paused: bool,
    /// PDA bump
    pub bump: u8,
}

impl MarketplaceConfig {
    pub const LEN: usize = 8 + 32 + 32 + 2 + 8 + 8 + 1 + 1; // Discriminator + fields
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum AssetCategory {
    Commercial,
    Residential,
    Industrial,
    Gold,
    Infrastructure,
    RenewableEnergy,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum VerificationStatus {
    PendingVerification,
    Approved,
    Rejected,
    Suspended,
}

#[account]
pub struct AssetOffering {
    /// Unique 32-byte identifier for the real-world property or commodity
    pub asset_id: [u8; 32],
    /// Asset sponsor / issuer authority
    pub issuer: Pubkey,
    /// SPL token mint representing fractional title to the SPV
    pub token_mint: Pubkey,
    /// Vault PDA holding available tokens for sale to investors
    pub vault_token_account: Pubkey,
    /// Currency used for subscriptions and dividends (SPL USDC)
    pub payment_mint: Pubkey,
    /// Total independent appraisal valuation in USDC
    pub total_valuation_usdc: u64,
    /// Fixed offering price per token in USDC (6 decimals)
    pub token_price_usdc: u64,
    /// Total fractional tokens minted
    pub total_token_supply: u64,
    /// Tokens remaining for public investment
    pub available_tokens: u64,
    /// Minimum investment amount in tokens
    pub minimum_investment_tokens: u64,
    /// Indicative annual yield in basis points (e.g. 1140 = 11.4% APY)
    pub expected_yield_bps: u16,
    /// Asset classification category
    pub category: AssetCategory,
    /// Compliance verification status
    pub verification_status: VerificationStatus,
    /// Arweave / IPFS metadata URI containing legal deed, CBRE valuation, SPV charter
    pub metadata_uri: String,
    /// Yield dividend index tracking (scaled by 1e12 for zero-dust division)
    pub accumulated_yield_per_token: u128,
    /// Cumulative yield distributed into the dividend pool in USDC
    pub total_yield_distributed_usdc: u64,
    /// Timestamp when listing was approved
    pub listing_timestamp: i64,
    /// Offer bump
    pub bump: u8,
    /// Token vault bump
    pub vault_bump: u8,
}

impl AssetOffering {
    pub const MAX_URI_LEN: usize = 128;
    pub const LEN: usize = 8 + 32 + 32 + 32 + 32 + 32 + 8 + 8 + 8 + 8 + 8 + 2 + 1 + 1 + (4 + Self::MAX_URI_LEN) + 16 + 8 + 8 + 1 + 1;
}

#[account]
#[derive(Default)]
pub struct InvestorPosition {
    /// Investor wallet authority
    pub investor: Pubkey,
    /// Associated AssetOffering PDA
    pub asset_offering: Pubkey,
    /// Total fractional tokens held
    pub tokens_held: u64,
    /// Snapshot of the asset yield index when investor last updated position
    pub last_accumulated_yield_index: u128,
    /// Unclaimed dividend rewards ready to claim in USDC
    pub unclaimed_yield_usdc: u64,
    /// Cumulative dividend yield claimed to date in USDC
    pub total_yield_claimed_usdc: u64,
    /// Total principal USDC invested
    pub total_invested_usdc: u64,
    /// PDA bump
    pub bump: u8,
}

impl InvestorPosition {
    pub const LEN: usize = 8 + 32 + 32 + 8 + 16 + 8 + 8 + 8 + 1;
}
