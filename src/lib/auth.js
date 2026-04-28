const encoder = new TextEncoder()
const SESSION_COOKIE = 'cardday_session'
const SESSION_TTL = 60 * 60 * 24 * 14

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

function toBase64Url(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer)
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

async function sign(secret, value) {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(value))
  return toBase64Url(sig)
}

export async function createSessionValue(secret) {
  const expiresAt = Math.floor(Date.now() / 1000) + SESSION_TTL
  const payload = String(expiresAt)
  const signature = await sign(secret, payload)
  return `${payload}.${signature}`
}

export async function verifySessionValue(secret, value) {
  if (!secret || !value || !value.includes('.')) return false
  const [payload, signature] = value.split('.', 2)
  const expiresAt = Number(payload)
  if (!Number.isFinite(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) return false
  const expected = await sign(secret, payload)
  return timingSafeEqual(signature, expected)
}

export function getSessionCookieName() {
  return SESSION_COOKIE
}

export function getSessionTtl() {
  return SESSION_TTL
}
