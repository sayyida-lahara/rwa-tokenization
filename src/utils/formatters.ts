export function formatCurrency(amount: number, compact = false): string {
  if (compact) {
    if (amount >= 1_000_000_000) {
      return `$${(amount / 1_000_000_000).toFixed(2)}B`;
    }
    if (amount >= 1_000_000) {
      return `$${(amount / 1_000_000).toFixed(2)}M`;
    }
    if (amount >= 1_000) {
      return `$${(amount / 1_000).toFixed(1)}k`;
    }
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function shortenAddress(address: string | null | undefined, chars = 4): string {
  if (!address) return '';
  if (address.length <= chars * 2 + 2) return address;
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
}

export function getSolanaExplorerUrl(
  item: string,
  type: 'tx' | 'address' = 'tx',
  cluster = 'testnet'
): string {
  const clusterParam = cluster === 'mainnet-beta' ? '' : `?cluster=${cluster}`;
  return `https://explorer.solana.com/${type}/${item}${clusterParam}`;
}

export function getSolscanUrl(
  item: string,
  type: 'tx' | 'account' = 'tx',
  cluster = 'testnet'
): string {
  const clusterParam = cluster === 'mainnet-beta' ? '' : `?cluster=${cluster}`;
  return `https://solscan.io/${type}/${item}${clusterParam}`;
}

