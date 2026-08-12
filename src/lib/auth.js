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

// ---- 登录密码哈希存储（放 D1，不明文）----
// 格式：sha256:<saltHex>:<hashHex>，hash = SHA-256(salt + password)
const HASH_PREFIX = 'sha256'

function toHex(buffer) {
  return Array.from(new Uint8Array(buffer)).map((b) => b.toString(16).padStart(2, '0')).join('')
}

function randomHex(byteLength) {
  const bytes = new Uint8Array(byteLength)
  crypto.getRandomValues(bytes)
  return toHex(bytes)
}

export function isHashFormat(value) {
  return typeof value === 'string' && value.startsWith(HASH_PREFIX + ':') && value.split(':').length === 3
}

export async function hashPassword(password) {
  const salt = randomHex(16)
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(salt + password))
  return `${HASH_PREFIX}:${salt}:${toHex(digest)}`
}

export async function verifyPassword(input, storedHash) {
  if (!isHashFormat(storedHash)) return false
  const salt = storedHash.split(':', 2)[1]
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(salt + input))
  const computed = `${HASH_PREFIX}:${salt}:${toHex(digest)}`
  return timingSafeEqual(computed, storedHash)
}

export function getSessionCookieName() {
  return SESSION_COOKIE
}

export function getSessionTtl() {
  return SESSION_TTL
}
