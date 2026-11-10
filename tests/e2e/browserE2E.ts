import { spawn } from 'child_process';

interface PageTestConfig {
  name: string;
  url: string;
  assertions: {
    label: string;
    pattern: string | RegExp;
  }[];
}

const DEFAULT_TARGET = process.env.BASE_URL || 'http://localhost:3000';

function getTestPages(baseUrl: string): PageTestConfig[] {
  return [
  // 1. Public Pages
  {
    name: 'Homepage (Hero, Stats, Featured Assets)',
    url: `${baseUrl}/`,
    assertions: [
      { label: 'Hero Headline', pattern: /Own a Piece of the/i },
      { label: 'Brand Name', pattern: /Asset/i },
      { label: 'Solana Testnet Technology Banner', pattern: /Solana Testnet/i },
      { label: 'Platform Statistics', pattern: /Total Asset Value|Total Assets Listed/i },
      { label: 'Action Buttons', pattern: /Explore Assets/i },
      { label: 'How It Works Preview', pattern: /How It Works/i },
    ],
  },
  {
    name: 'Explore Marketplace (Filters, Search, Cards)',
    url: `${baseUrl}/explore`,
    assertions: [
      { label: 'Page Title', pattern: /Explore Real World Assets/i },
      { label: 'Category Filter Sidebar', pattern: /Commercial|Residential|Gold/i },
      { label: 'Sorting Controls', pattern: /Sort by|Recently Listed/i },
      { label: 'Asset Cards Rendered', pattern: /Bangalore|Mumbai|Dubai/i },
      { label: 'Verified Badges', pattern: /Verified|Approved/i },
    ],
  },
  {
    name: 'Asset Details Page (Bangalore Commercial Tech Park)',
    url: `${baseUrl}/asset/asset-1`,
    assertions: [
      { label: 'Asset Title', pattern: /Premium Commercial Building/i },
      { label: 'Location Flag & City', pattern: /Bangalore.*India/i },
      { label: 'Token Valuation & Price', pattern: /\$50/i },
      { label: 'Total Supply', pattern: /Supply|490,000/i },
      { label: 'Invest Now Calculation Panel', pattern: /Quantity to Acquire|Total Investment|Available Supply/i },
      { label: 'Blockchain Architecture Tab', pattern: /Blockchain|Overview/i },
    ],
  },
  {
    name: 'Category: Real Estate',
    url: `${baseUrl}/category/real-estate`,
    assertions: [
      { label: 'Category Header', pattern: /Real Estate/i },
      { label: 'Listings', pattern: /Bangalore|Mumbai/i },
    ],
  },
  {
    name: 'Category: Commodities',
    url: `${baseUrl}/category/commodities`,
    assertions: [
      { label: 'Category Header', pattern: /Commodities|Gold/i },
      { label: 'Swiss Gold Vaults', pattern: /Gold/i },
    ],
  },
  {
    name: 'Category: Infrastructure',
    url: `${baseUrl}/category/infrastructure`,
    assertions: [
      { label: 'Category Header', pattern: /Infrastructure|Energy/i },
      { label: 'Solar & Clean Energy Assets', pattern: /Solar|Energy|Port/i },
    ],
  },
  {
    name: 'How It Works (Solana Architecture & SPV Flow)',
    url: `${baseUrl}/how-it-works`,
    assertions: [
      { label: 'Headline', pattern: /How Real World Asset Tokenization Works/i },
      { label: 'Stage 1 Due Diligence', pattern: /Asset Sourcing/i },
      { label: 'Stage 2 SPV Structure', pattern: /SPV Structuring/i },
      { label: 'Stage 3 Solana Anchor Tokenization', pattern: /Solana Anchor Tokenization/i },
      { label: 'Stage 5 Automated Settlement', pattern: /Automated.*Settlement|Secondary Settlement/i },
    ],
  },
  {
    name: 'Login / Authentication Portal',
    url: `${baseUrl}/login`,
    assertions: [
      { label: 'Login Header', pattern: /Sign In to Asset|Select a pre-configured demo account/i },
      { label: 'Demo Persona Selectors', pattern: /Investor|Issuer|Admin/i },
    ],
  },

  // 2. Investor Pages
  {
    name: 'Investor Dashboard',
    url: `${baseUrl}/investor/dashboard`,
    assertions: [
      { label: 'Dashboard Overview', pattern: /Portfolio Value|Total Invested/i },
      { label: 'Asset Holdings Table', pattern: /Asset|Tokens|Status/i },
      { label: 'Recent Activity', pattern: /Recent Activity|Transaction/i },
    ],
  },
  {
    name: 'Investor Portfolio & Charts',
    url: `${baseUrl}/investor/portfolio`,
    assertions: [
      { label: 'Portfolio Analytics Header', pattern: /Portfolio Analytics|Portfolio Net Worth/i },
      { label: 'Historical Valuation Trajectory', pattern: /Historical Valuation Growth|Total Return Trajectory/i },
    ],
  },
  {
    name: 'Investor Transaction History',
    url: `${baseUrl}/investor/transactions`,
    assertions: [
      { label: 'Transaction Ledger Header', pattern: /Transaction History|Transactions/i },
      { label: 'Solana Signature Column', pattern: /Solana Tx Signature|Signature/i },
      { label: 'Testnet Cluster Labels', pattern: /testnet|Solana/i },
    ],
  },
  {
    name: 'Investor Watchlist',
    url: `${baseUrl}/investor/watchlist`,
    assertions: [
      { label: 'Watchlist Title', pattern: /Watchlist|Saved Assets/i },
    ],
  },
  {
    name: 'Investor Settings & Solana Keypair',
    url: `${baseUrl}/investor/settings`,
    assertions: [
      { label: 'Settings Header', pattern: /Profile.*Security Settings/i },
      { label: 'Solana Custody Key', pattern: /Connected Solana Custody Address|Primary Solana Base58/i },
    ],
  },

  // 3. Asset Issuer Pages
  {
    name: 'Asset Issuer Dashboard',
    url: `${baseUrl}/issuer/dashboard`,
    assertions: [
      { label: 'Issuer Console Header', pattern: /Issuer Dashboard|Submitted Assets/i },
      { label: 'Approval Status Metrics', pattern: /Approved|Pending/i },
      { label: 'Tokenize CTA Button', pattern: /Tokenize/i },
    ],
  },
  {
    name: 'Asset Tokenization Wizard (5-Step)',
    url: `${baseUrl}/issuer/tokenize`,
    assertions: [
      { label: 'Wizard Header', pattern: /Tokenize a Real World Asset|Basic Information/i },
      { label: 'Form Input Fields', pattern: /Asset Name|Category|Valuation/i },
      { label: 'Solana Anchor Deployment', pattern: /Solana|Anchor/i },
    ],
  },
  {
    name: 'Issuer Listed Assets',
    url: `${baseUrl}/issuer/assets`,
    assertions: [
      { label: 'Listed Assets Header', pattern: /My Listed Assets|Offerings/i },
    ],
  },
  {
    name: 'Issuer Asset Submission Status',
    url: `${baseUrl}/issuer/status`,
    assertions: [
      { label: 'Status Header', pattern: /Asset Submission Status|Verification/i },
    ],
  },

  // 4. Admin Pages
  {
    name: 'Admin Dashboard',
    url: `${baseUrl}/admin/dashboard`,
    assertions: [
      { label: 'Admin Console Header', pattern: /Admin Overview|Compliance/i },
      { label: 'Platform Metrics', pattern: /Listed Assets|Total Volume/i },
    ],
  },
  {
    name: 'Admin Asset Verification Queue',
    url: `${baseUrl}/admin/verification`,
    assertions: [
      { label: 'Verification Queue Header', pattern: /Asset Verification/i },
      { label: 'Review Controls', pattern: /Approve|Reject|Review/i },
    ],
  },
  {
    name: 'Admin User Management',
    url: `${baseUrl}/admin/users`,
    assertions: [
      { label: 'User Directory Header', pattern: /User Management/i },
      { label: 'KYC & Wallet Address Table', pattern: /Wallet Address|Status/i },
    ],
  },
  {
    name: 'Admin Marketplace Management',
    url: `${baseUrl}/admin/marketplace`,
    assertions: [
      { label: 'Marketplace Management Header', pattern: /Marketplace Management|Parameters|Configuration/i },
    ],
  },
];
}

async function fetchPageDOM(url: string): Promise<string> {
  const useChrome = Boolean(process.env.CHROME_BIN);
  if (useChrome) {
    const chromeBin = process.env.CHROME_BIN || 'google-chrome';
    return new Promise((resolve, reject) => {
      const chrome = spawn(chromeBin, [
        '--headless=new',
        '--dump-dom',
        '--disable-gpu',
        '--no-sandbox',
        '--virtual-time-budget=4000',
        url,
      ]);

      let stdout = '';
      let stderr = '';

      chrome.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      chrome.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      chrome.on('close', (code) => {
        if (code === 0) {
          resolve(stdout.replace(/<!--[\s\S]*?-->/g, ''));
        } else {
          reject(new Error(`Chrome exited with code ${code}: ${stderr}`));
        }
      });

      chrome.on('error', (err) => reject(err));
    });
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }
  const text = await res.text();
  // Strip SSR comment delimiters so literal text and expressions match seamlessly
  return text.replace(/<!--[\s\S]*?-->/g, '');
}

async function ensureServerRunning(targetUrl: string): Promise<{ baseUrl: string; stop: () => void }> {
  try {
    const check = await fetch(`${targetUrl}/api/health`, { signal: AbortSignal.timeout(1000) });
    if (check.ok) {
      return { baseUrl: targetUrl, stop: () => {} };
    }
  } catch {
    // server not running on targetUrl
  }

  const port = process.env.PORT || '3000';
  const localBase = `http://localhost:${port}`;
  try {
    const check = await fetch(`${localBase}/api/health`, { signal: AbortSignal.timeout(1000) });
    if (check.ok) {
      return { baseUrl: localBase, stop: () => {} };
    }
  } catch {
    // not running on localBase either
  }

  console.log(`[E2E Runner] Starting React Router server on ${localBase}...`);
  const server = spawn('bun', ['run', 'react-router-serve', './build/server/index.js'], {
    env: { ...process.env, PORT: port },
    stdio: 'ignore',
  });

  const start = Date.now();
  let up = false;
  while (Date.now() - start < 15000) {
    try {
      const res = await fetch(`${localBase}/api/health`, { signal: AbortSignal.timeout(1000) });
      if (res.ok) {
        up = true;
        break;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }

  if (!up) {
    server.kill();
    throw new Error(`Failed to start React Router server on ${localBase}`);
  }

  return {
    baseUrl: localBase,
    stop: () => {
      server.kill();
    },
  };
}

async function runBrowserE2E() {
  const serverHandle = await ensureServerRunning(DEFAULT_TARGET);
  const activeBaseUrl = serverHandle.baseUrl;
  const testPages = getTestPages(activeBaseUrl);

  console.log('================================================================');
  console.log('🌐 ASSETX END-TO-END (E2E) DOM & ROUTE TEST SUITE');
  console.log(`   Target: ${activeBaseUrl} (${process.env.CHROME_BIN ? 'Google Chrome Headless' : 'SSR Engine'})`);
  console.log('================================================================\n');

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  const startTime = Date.now();

  try {
    for (let i = 0; i < testPages.length; i++) {
      const page = testPages[i];
      const pageStart = Date.now();
      process.stdout.write(`[${i + 1}/${testPages.length}] Testing ${page.name}... `);

      try {
        const dom = await fetchPageDOM(page.url);
        const elapsed = Date.now() - pageStart;

        let allPassed = true;
        const failureDetails: string[] = [];

        for (const assertion of page.assertions) {
          totalTests++;
          const matches =
            typeof assertion.pattern === 'string'
              ? dom.includes(assertion.pattern)
              : assertion.pattern.test(dom);

          if (matches) {
            passedTests++;
          } else {
            failedTests++;
            allPassed = false;
            failureDetails.push(`  ❌ Missing: ${assertion.label} (${assertion.pattern})`);
          }
        }

        if (allPassed) {
          console.log(`✅ OK (${elapsed}ms, ${page.assertions.length} assertions passed)`);
        } else {
          console.log(`❌ FAILED (${elapsed}ms)`);
          for (const detail of failureDetails) {
            console.log(detail);
          }
        }
      } catch (err: any) {
        console.log(`❌ ERROR`);
        console.log(`  Failed to load ${page.url}: ${err.message}`);
        totalTests += page.assertions.length;
        failedTests += page.assertions.length;
      }
    }
  } finally {
    serverHandle.stop();
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('\n================================================================');
  console.log(`📊 BROWSER E2E TEST SUMMARY:`);
  console.log(`   Total Pages Tested: ${testPages.length}`);
  console.log(`   Total DOM Assertions: ${totalTests}`);
  console.log(`   Passed: ${passedTests}`);
  console.log(`   Failed: ${failedTests}`);
  console.log(`   Duration: ${durationSec}s`);
  console.log('================================================================\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runBrowserE2E().catch((err) => {
  console.error('Fatal E2E test runner error:', err);
  process.exit(1);
});
