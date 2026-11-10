import type { ActionFunctionArgs, LoaderFunctionArgs } from 'react-router';

import type { MarketplaceSettings, SolanaCluster, UserPreferences, UserRole } from '../../src/types';
import {
  ApiError,
  executeInvestment,
  getAssetById,
  getAssets,
  getBootstrap,
  getChainInfo,
  getDerivedPDAs,
  getMarketplaceSettings,
  getNewsletterSubscribers,
  getPortfolioSummary,
  getPreferencesForUser,
  getTransactions,
  getUsers,
  getUserById,
  getWatchlist,
  loginAsRole,
  loginWithEmail,
  removeFromWatchlist,
  resetDemoData,
  saveMarketplaceSettings,
  savePreferences,
  submitAsset,
  subscribeNewsletter,
  switchCluster,
  toggleWatchlist,
  updateAssetStatus,
  updateUser,
  connectWallet,
  disconnectWallet,
} from '../server/repository.server';

function segmentsFor(request: Request): string[] {
  const pathname = new URL(request.url).pathname;
  return pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean);
}

function json(payload: unknown, status = 200): Response {
  return Response.json(payload, { status });
}

function errorResponse(error: unknown): Response {
  if (error instanceof ApiError) {
    return json({ error: error.message }, error.status);
  }
  if (error instanceof SyntaxError) {
    return json({ error: 'Request body must be valid JSON' }, 400);
  }
  console.error('[AssetX API] Unhandled error:', error);
  const message = error instanceof Error ? error.message : 'Internal server error';
  return json({ error: message }, 500);
}

async function readBody<T>(request: Request): Promise<T> {
  const text = await request.text();
  if (!text) return {} as T;
  return JSON.parse(text) as T;
}

export async function loader({ request }: LoaderFunctionArgs): Promise<Response> {
  try {
    const segments = segmentsFor(request);

    if (segments.length === 0 || segments[0] === 'bootstrap') {
      return json(getBootstrap());
    }

    if (segments[0] === 'health') {
      const bootstrap = getBootstrap();
      return json({
        ok: true,
        database: 'sqlite',
        assets: bootstrap.assets.length,
        users: bootstrap.users.length,
        transactions: bootstrap.transactions.length,
        chain: bootstrap.chain,
      });
    }

    if (segments[0] === 'assets' && segments.length === 1) {
      return json({ assets: getAssets() });
    }

    if (segments[0] === 'assets' && segments.length === 2) {
      const asset = getAssetById(segments[1]);
      if (!asset) throw new ApiError(`Asset not found: ${segments[1]}`, 404);
      return json({ asset });
    }

    if (segments[0] === 'users' && segments.length === 1) {
      return json({ users: getUsers() });
    }

    if (segments[0] === 'users' && segments.length === 2) {
      const user = getUserById(segments[1]);
      if (!user) throw new ApiError(`User not found: ${segments[1]}`, 404);
      return json({ user });
    }

    if (segments[0] === 'portfolio') {
      return json({ portfolio: getPortfolioSummary() });
    }

    if (segments[0] === 'transactions') {
      return json({ transactions: getTransactions() });
    }

    if (segments[0] === 'watchlist') {
      return json({ watchlistIds: getWatchlist() });
    }

    if (segments[0] === 'marketplace') {
      return json({ marketplace: getMarketplaceSettings() });
    }

    if (segments[0] === 'preferences' && segments.length === 2) {
      return json({ preferences: getPreferencesForUser(segments[1]) });
    }

    if (segments[0] === 'newsletter') {
      return json({ subscribers: getNewsletterSubscribers() });
    }

    if (segments[0] === 'chain' && segments[1] === 'pdas') {
      const url = new URL(request.url);
      const assetId = url.searchParams.get('assetId') || 'asset-1';
      const investorKey =
        url.searchParams.get('investor') || '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';
      return json(getDerivedPDAs(assetId, investorKey));
    }

    if (segments[0] === 'chain') {
      return json({ chain: getChainInfo() });
    }

    throw new ApiError(`Unknown API endpoint: ${segments.join('/')}`, 404);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function action({ request }: ActionFunctionArgs): Promise<Response> {
  try {
    const segments = segmentsFor(request);
    const method = request.method.toUpperCase();

    if (method === 'POST' && segments.length === 1 && segments[0] === 'reset') {
      return json(resetDemoData());
    }

    if (method === 'POST' && segments.length === 1 && segments[0] === 'assets') {
      const body = await readBody<Parameters<typeof submitAsset>[0]>(request);
      return json(submitAsset(body), 201);
    }

    if (segments[0] === 'assets' && segments[2] === 'status') {
      const body = await readBody<{
        status: Parameters<typeof updateAssetStatus>[1];
        reviewComments?: string;
        rejectionReason?: string;
      }>(request);
      return json({
        asset: updateAssetStatus(
          segments[1],
          body.status,
          body.reviewComments,
          body.rejectionReason
        ),
      });
    }

    if (method === 'POST' && segments.length === 1 && segments[0] === 'investments') {
      const body = await readBody<Parameters<typeof executeInvestment>[0]>(request);
      return json(executeInvestment(body), 201);
    }

    if (method === 'POST' && segments[0] === 'auth' && segments[1] === 'role') {
      const body = await readBody<{ role: UserRole }>(request);
      return json({ currentUser: loginAsRole(body.role) });
    }

    if (method === 'POST' && segments[0] === 'auth' && segments[1] === 'login') {
      const body = await readBody<{ email: string }>(request);
      const user = loginWithEmail(body.email || '');
      if (!user) throw new ApiError(`No demo account registered with ${body.email}`, 404);
      return json({ currentUser: user });
    }

    if (segments[0] === 'users' && segments.length === 2) {
      const body = await readBody<
        Partial<{
          name: string;
          phone: string;
          accountStatus: 'Active' | 'Suspended' | 'Pending KYC';
          walletAddress: string;
          kycLevel: 'Tier 1' | 'Tier 2' | 'Institutional';
          companyName: string;
          avatar: string;
        }>
      >(request);
      const user = updateUser(segments[1], body);
      return json({ user });
    }

    if (segments[0] === 'wallet' && segments[1] === 'connect') {
      const body = await readBody<{ type: 'phantom' | 'solflare' | 'backpack' | 'demo' }>(
        request
      );
      return json({ wallet: connectWallet(body.type || 'demo') });
    }

    if (segments[0] === 'wallet' && segments[1] === 'disconnect') {
      return json({ wallet: disconnectWallet() });
    }

    if (segments[0] === 'wallet' && segments[1] === 'cluster') {
      const body = await readBody<{ cluster: SolanaCluster }>(request);
      return json({ wallet: switchCluster(body.cluster) });
    }

    if (method === 'POST' && segments[0] === 'watchlist' && segments.length === 1) {
      const body = await readBody<{ assetId: string }>(request);
      return json({ watchlistIds: toggleWatchlist(body.assetId) });
    }

    if (segments[0] === 'watchlist' && segments.length === 2) {
      return json({ watchlistIds: removeFromWatchlist(segments[1]) });
    }

    if (segments[0] === 'preferences' && segments.length === 2) {
      const body = await readBody<UserPreferences>(request);
      return json({ preferences: savePreferences(segments[1], body) });
    }

    if (segments[0] === 'marketplace' && segments.length === 1) {
      const body = await readBody<MarketplaceSettings>(request);
      return json({ marketplace: saveMarketplaceSettings(body) });
    }

    if (method === 'POST' && segments[0] === 'newsletter') {
      const body = await readBody<{ email: string }>(request);
      return json({ subscribers: subscribeNewsletter(body.email || '') }, 201);
    }

    throw new ApiError(`Unknown API endpoint: ${segments.join('/')}`, 404);
  } catch (error) {
    return errorResponse(error);
  }
}
