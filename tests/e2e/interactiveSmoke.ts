/**
 * Interactive CDP smoke test: exercises the full investor purchase flow in a
 * real headless Chromium (asset page -> invest modal -> confirm -> receipt)
 * and verifies the persisted wallet/holdings/transaction state.
 *
 * Run with the dev server up:
 *   CHROME_BIN=/path/to/chromium bun run tests/e2e/interactiveSmoke.ts
 */
import { spawn } from 'child_process';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
const CHROME_BIN =
  process.env.CHROME_BIN ||
  process.env.PUPPETEER_EXECUTABLE_PATH ||
  process.env.CHROMIUM_PATH ||
  'chromium';
const DEBUG_PORT = Number(process.env.CDP_PORT || 9333);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitFor(check: () => Promise<boolean>, label: string, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (await check()) return;
    await sleep(150);
  }
  throw new Error(`Timed out waiting for ${label}`);
}

async function main() {
  const chrome = spawn(CHROME_BIN, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    `--remote-debugging-port=${DEBUG_PORT}`,
    `--user-data-dir=/tmp/opencode/assetx-smoke-${Date.now()}`,
    'about:blank',
  ]);

  chrome.on('error', (err) => {
    console.error('Failed to launch Chromium:', err);
    process.exit(1);
  });

  let ws: WebSocket | null = null;
  try {
    // Wait for the DevTools endpoint.
    let targetInfo: { webSocketDebuggerUrl: string } | null = null;
    await waitFor(
      async () => {
        try {
          const res = await fetch(
            `http://127.0.0.1:${DEBUG_PORT}/json/new?${encodeURIComponent(`${BASE_URL}/asset/asset-1`)}`,
            { method: 'PUT' }
          );
          if (!res.ok) return false;
          targetInfo = (await res.json()) as { webSocketDebuggerUrl: string };
          return Boolean(targetInfo.webSocketDebuggerUrl);
        } catch {
          return false;
        }
      },
      'Chromium DevTools endpoint'
    );

    ws = new WebSocket(targetInfo!.webSocketDebuggerUrl);
    await new Promise<void>((resolve, reject) => {
      ws!.addEventListener('open', () => resolve());
      ws!.addEventListener('error', () => reject(new Error('CDP websocket failed')));
    });

    let messageId = 0;
    const pending = new Map<number, (value: any) => void>();
    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(String(event.data));
      if (msg.id && pending.has(msg.id)) {
        pending.get(msg.id)!(msg);
        pending.delete(msg.id);
      }
    });

    const send = (method: string, params: Record<string, unknown> = {}) => {
      const id = ++messageId;
      ws!.send(JSON.stringify({ id, method, params }));
      return new Promise<any>((resolve) => pending.set(id, resolve));
    };

    const evaluate = async (expression: string) => {
      const response = await send('Runtime.evaluate', {
        expression,
        returnByValue: true,
        awaitPromise: true,
      });
      if (response.result?.exceptionDetails) {
        throw new Error(
          `Browser evaluation failed: ${JSON.stringify(response.result.exceptionDetails)}`
        );
      }
      return response.result?.result?.value;
    };

    await send('Runtime.enable');
    await send('Page.enable');

    await waitFor(
      async () =>
        (await evaluate(`document.readyState === 'complete' && document.body.innerText.includes('Invest')`)) === true,
      'asset details page'
    );

    const initial = await evaluate(`(() => {
      // The demo wallet is lazily persisted by the service, so fall back to the
      // seeded balance when no wallet key exists yet.
      const wallet = JSON.parse(localStorage.getItem('assetx_solana_wallet_testnet_v3') || 'null') || { balanceUSDC: 145250 };
      const holdings = JSON.parse(localStorage.getItem('assetx_solana_holdings_testnet_v3') || '[]');
      const txCount = JSON.parse(localStorage.getItem('assetx_solana_transactions_testnet_v3') || '[]').length;
      const holding = holdings.find((h) => h.assetId === 'asset-1');
      return { balance: wallet.balanceUSDC, tokens: holding?.tokenQuantity ?? 0, txCount };
    })()`);

    const clickedInvest = await evaluate(`(() => {
      const button = [...document.querySelectorAll('button')].find((b) =>
        /^Invest \\$/.test(b.textContent.trim())
      );
      if (!button) return false;
      button.click();
      return true;
    })()`);
    if (!clickedInvest) throw new Error('Invest button not found on asset page');

    await waitFor(
      async () => (await evaluate(`document.body.innerText.includes('Review Investment')`)) === true,
      'invest modal'
    );

    const selectedPreset = await evaluate(`(() => {
      const button = [...document.querySelectorAll('button')].find(
        (b) => b.textContent.trim() === '25 tokens'
      );
      if (!button) return false;
      button.click();
      return true;
    })()`);
    if (!selectedPreset) throw new Error('25-token preset not found');

    const clickedReview = await evaluate(`(() => {
      const button = [...document.querySelectorAll('button')].find(
        (b) => b.textContent.trim() === 'Review Investment'
      );
      if (!button) return false;
      button.click();
      return true;
    })()`);
    if (!clickedReview) throw new Error('Review Investment button not found');

    await waitFor(
      async () =>
        (await evaluate(`document.body.innerText.includes('Confirm On-Chain Investment')`)) === true,
      'confirmation step'
    );

    const clickedConfirm = await evaluate(`(() => {
      const button = [...document.querySelectorAll('button')].find(
        (b) => b.textContent.trim() === 'Confirm On-Chain Investment'
      );
      if (!button) return false;
      button.click();
      return true;
    })()`);
    if (!clickedConfirm) throw new Error('Confirm button not found');

    await waitFor(
      async () => (await evaluate(`document.body.innerText.includes('Investment Confirmed')`)) === true,
      'investment receipt'
    );

    const after = await evaluate(`(() => {
      const wallet = JSON.parse(localStorage.getItem('assetx_solana_wallet_testnet_v3') || '{}');
      const holdings = JSON.parse(localStorage.getItem('assetx_solana_holdings_testnet_v3') || '[]');
      const txs = JSON.parse(localStorage.getItem('assetx_solana_transactions_testnet_v3') || '[]');
      const holding = holdings.find((h) => h.assetId === 'asset-1');
      return {
        balance: wallet.balanceUSDC,
        tokens: holding?.tokenQuantity ?? 0,
        txCount: txs.length,
        latest: txs[0],
      };
    })()`);

    const expectedTotal = 25 * 50 + 25 * 50 * 0.005; // 25 tokens + 0.5% protocol fee
    const balanceDelta = initial.balance - after.balance;
    const tokenDelta = after.tokens - initial.tokens;

    const checks: { label: string; passed: boolean; detail: string }[] = [
      {
        label: 'Wallet debited by total + fee',
        passed: Math.abs(balanceDelta - expectedTotal) < 0.01,
        detail: `debited $${balanceDelta.toFixed(2)} (expected $${expectedTotal.toFixed(2)})`,
      },
      {
        label: '25 tokens added to holding',
        passed: tokenDelta === 25,
        detail: `${tokenDelta} tokens added`,
      },
      {
        label: 'Transaction recorded',
        passed: after.txCount === initial.txCount + 1 && after.latest?.assetId === 'asset-1',
        detail: `${initial.txCount} -> ${after.txCount} transactions`,
      },
      {
        label: 'Transaction totals persisted',
        passed:
          after.latest?.tokenQuantity === 25 &&
          Math.abs(after.latest?.totalAmount - expectedTotal) < 0.01,
        detail: `qty=${after.latest?.tokenQuantity}, total=$${after.latest?.totalAmount}`,
      },
      {
        label: 'Receipt shows Solana signature',
        passed: typeof after.latest?.signature === 'string' && after.latest.signature.length > 40,
        detail: `${after.latest?.signature?.slice(0, 12)}...`,
      },
    ];

    let failed = 0;
    console.log('\n🧪 ASSETX INTERACTIVE PURCHASE-FLOW SMOKE TEST');
    console.log('================================================================');
    for (const check of checks) {
      console.log(`${check.passed ? '✅' : '❌'} ${check.label} — ${check.detail}`);
      if (!check.passed) failed++;
    }
    console.log('================================================================');
    console.log(`${checks.length - failed}/${checks.length} checks passed\n`);

    if (failed > 0) process.exitCode = 1;
  } finally {
    ws?.close();
    chrome.kill('SIGKILL');
  }
}

main().catch((err) => {
  console.error('Fatal interactive smoke test error:', err);
  process.exit(1);
});
