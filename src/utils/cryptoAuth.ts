/**
 * Cryptographic helper for secure client-side and offline password verification.
 * Utilizes the standard W3C Web Crypto API (supported natively in modern browsers and Node/Electron).
 */

export function generateSalt(): string {
  const arr = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(arr);
  } else {
    for (let i = 0; i < 16; i++) {
      arr[i] = Math.floor(Math.random() * 256);
    }
  }
  return Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function hashPasswordWithSalt(password: string, salt: string): Promise<string> {
  if (!password) return '';
  const enc = new TextEncoder();
  const data = enc.encode(`${salt}:${password}`);
  if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback if subtle is unavailable
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const byte = data[i] ?? 0;
    hash = ((hash << 5) - hash) + byte;
    hash |= 0;
  }
  return Math.abs(hash).toString(16);
}
