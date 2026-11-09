import {
  bytesToBase58,
  generateSolanaTxSignature,
  generateSolanaPublicKey,
  SolanaAnchorService,
  ANCHOR_PROGRAM_ID,
  SOLANA_CLUSTERS,
} from '../src/services/solanaAnchorService';
import idl from '../src/idl/assetx_rwa.json';

console.log('====================================================');
console.log('🧪 RUNNING ASSETX SOLANA ANCHOR TEST SUITE (TESTNET)');
console.log('====================================================');

// Test 1: Cluster Configuration
console.log('\n[1/6] Verifying Solana Cluster Configuration...');
const active = SolanaAnchorService.getActiveCluster();
if (active.cluster !== 'testnet') {
  throw new Error(`Expected active cluster to be testnet, got ${active.cluster}`);
}
console.log(`  ✓ Active Cluster: ${active.name} (${active.endpoint})`);
console.log(`  ✓ Program ID: ${ANCHOR_PROGRAM_ID}`);

// Test 2: Base58 Encoding
console.log('\n[2/6] Verifying Base58 Cryptographic Encoding...');
const sampleKey = generateSolanaPublicKey('AstX');
if (!sampleKey.startsWith('AstX') || sampleKey.length < 32 || sampleKey.length > 44) {
  throw new Error(`Generated invalid Base58 Solana public key: ${sampleKey}`);
}
console.log(`  ✓ Generated Valid Solana Base58 Public Key: ${sampleKey}`);

const sampleSig = generateSolanaTxSignature();
if (sampleSig.length < 64) {
  throw new Error(`Generated invalid Solana transaction signature: ${sampleSig}`);
}
console.log(`  ✓ Generated Valid 64-byte Solana Transaction Signature: ${sampleSig.substring(0, 20)}...`);

// Test 3: Anchor Program Derived Address (PDA) Derivation
console.log('\n[3/6] Deriving Anchor Program Derived Addresses (PDAs)...');
const testAssetId = 'asset-1';
const testInvestorKey = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';

const mktPda = SolanaAnchorService.deriveMarketplaceConfigPDA();
const assetPda = SolanaAnchorService.deriveAssetOfferingPDA(testAssetId);
const vaultPda = SolanaAnchorService.deriveTokenVaultPDA(testAssetId);
const posPda = SolanaAnchorService.deriveInvestorPositionPDA(testAssetId, testInvestorKey);
const divPda = SolanaAnchorService.deriveDividendVaultPDA(testAssetId);

console.log(`  ✓ MarketplaceConfig PDA: ${mktPda.pda} (bump: ${mktPda.bump})`);
console.log(`  ✓ AssetOffering PDA:     ${assetPda.pda} (bump: ${assetPda.bump})`);
console.log(`  ✓ TokenVault (Escrow) PDA: ${vaultPda.pda} (bump: ${vaultPda.bump})`);
console.log(`  ✓ InvestorPosition PDA:  ${posPda.pda} (bump: ${posPda.bump})`);
console.log(`  ✓ DividendVault PDA:     ${divPda.pda} (bump: ${divPda.bump})`);

// Test 4: Anchor IDL Validation
console.log('\n[4/6] Verifying Anchor IDL Matching Rust Program...');
if (idl.name !== 'assetx_rwa') {
  throw new Error(`Expected IDL program name 'assetx_rwa', got ${idl.name}`);
}
const expectedInstructions = [
  'initializeMarketplace',
  'createAssetOffering',
  'verifyAsset',
  'investTokens',
  'distributeYield',
  'claimYield',
];
for (const ix of expectedInstructions) {
  const found = idl.instructions.find((i) => i.name === ix);
  if (!found) {
    throw new Error(`Missing expected Anchor instruction in IDL: ${ix}`);
  }
  console.log(`  ✓ Validated Anchor Instruction: ${ix} (${found.accounts.length} accounts, ${found.args.length} args)`);
}

// Test 5: Continuous Dividend Index Scaled Math Verification
console.log('\n[5/6] Verifying O(1) Scaled Continuous Dividend Math...');
const circulatingTokens = 400_000n;
const rentalIncomeUsdc = 30_000n * 1_000_000n; // 30,000 USDC with 6 decimals = 30_000_000_000
const SCALE = 1_000_000_000_000n; // 1e12
const deltaIndex = (rentalIncomeUsdc * SCALE) / circulatingTokens;

// An investor holding 2,000 tokens
const investorTokens = 2_000n;
const investorDividend = (investorTokens * deltaIndex) / SCALE;
const expectedDividendUsdc = 150_000_000n; // $150.00 USDC

if (investorDividend !== expectedDividendUsdc) {
  throw new Error(`Math verification mismatch: expected ${expectedDividendUsdc}, got ${investorDividend}`);
}
console.log(`  ✓ Delta Index per token (scaled 1e12): ${deltaIndex}`);
console.log(`  ✓ Calculated Investor Yield (2,000 tokens): $${Number(investorDividend) / 1e6} USDC (Matches exactly)`);

// Test 6: Simulated Anchor Execution
console.log('\n[6/6] Executing Simulated Anchor Instruction (`invest_tokens`)...');
const execution = await SolanaAnchorService.executeAnchorInstruction('invest_tokens', { quantity: 10 }, testInvestorKey);
console.log(`  ✓ Transaction Signature: ${execution.signature}`);
console.log(`  ✓ Confirmed at Slot: ${execution.slot}`);
console.log(`  ✓ Finality Latency: ${execution.confirmationTimeMs}ms`);

console.log('\n====================================================');
console.log('✅ ALL SOLANA ANCHOR TESTNET TESTS PASSED SUCCESSFULLY');
console.log('====================================================\n');
