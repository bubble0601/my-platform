/**
 * @see
 * https://github.com/remix-run/remix/blob/main/packages/remix-server-runtime/crypto.ts
 */
import { env } from '../../utils/env'

const encoder = new TextEncoder()

export async function sign(value: string, secret: string = env.SESSION_SECRET): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const data = encoder.encode(value)
  const signature = await crypto.subtle.sign('HMAC', key, data)
  const hash = Buffer.from(signature).toString('base64').replace(/=+$/, '')

  return value + '.' + hash
}

export async function unsign(
  cookie: string,
  secret: string = env.SESSION_SECRET
): Promise<string | false> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  )

  const value = cookie.slice(0, cookie.lastIndexOf('.'))
  const hash = cookie.slice(cookie.lastIndexOf('.') + 1)

  const data = encoder.encode(value)
  const signature = Buffer.from(hash, 'base64')
  const valid = await crypto.subtle.verify('HMAC', key, signature, data)

  return valid ? value : false
}
