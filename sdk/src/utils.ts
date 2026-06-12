/**
 * Generate a unique request ID using UUID v4
 */
export function generateRequestId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * Generate a nonce string
 */
export function generateNonce(): string {
  const timestamp = Date.now().toString(36);
  let randomStr: string;
  
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const randomBytes = new Uint8Array(16);
    crypto.getRandomValues(randomBytes);
    randomStr = Array.from(randomBytes, (byte) => 
      (byte % 36).toString(36)
    ).join('').substring(0, 16);
  } else {
    // Fallback for environments without crypto API
    randomStr = Math.random().toString(36).substring(2, 18);
  }
  
  return `${timestamp}${randomStr}`;
}

/**
 * HMAC-SHA256 signature
 */
export async function hmacSha256(data: string, secret: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
    const hashArray = Array.from(new Uint8Array(signature));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Fallback for environments without Web Crypto API
  throw new Error('Web Crypto API is not available');
}

/**
 * Get or generate device ID
 */
export async function getDeviceId(): Promise<string> {
  let deviceId = localStorage.getItem('deviceId');
  if (!deviceId) {
    deviceId = generateRequestId(); // Fallback to request ID
    localStorage.setItem('deviceId', deviceId);
  }
  return deviceId;
}
