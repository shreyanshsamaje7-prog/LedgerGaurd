/**
 * Format currency with internationalization
 */
export function formatCurrency(amount, currency = 'INR') {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    return '₹0.00';
  }

  const num = Number(amount);

  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency || 'INR',
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(num);
  } catch {
    return `₹${num.toFixed(2)}`;
  }
}

/**
 * Format timestamp nicely
 */
export function formatDate(dateString) {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(date);
}

/**
 * Truncate long ObjectIDs or hashes
 */
export function truncateId(id, startChars = 6, endChars = 4) {
  if (!id) return '';
  const str = String(id);
  if (str.length <= startChars + endChars) return str;
  return `${str.slice(0, startChars)}...${str.slice(-endChars)}`;
}

/**
 * Generate a cryptographically secure idempotency key
 */
export function generateIdempotencyKey(prefix = 'txn') {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  const random = Math.random().toString(36).substring(2, 12);
  const timestamp = Date.now().toString(36);
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Copy to clipboard helper
 */
export async function copyToClipboard(text) {
  if (!text) return false;
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  } catch {
    return false;
  }
}
