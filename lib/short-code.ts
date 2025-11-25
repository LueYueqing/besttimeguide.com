import crypto from 'crypto'

const DEFAULT_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function generateShortCode(length = 8, alphabet = DEFAULT_ALPHABET): string {
  if (length <= 0) {
    throw new Error('Short code length must be greater than zero')
  }

  const chars = alphabet || DEFAULT_ALPHABET
  const bytes = crypto.randomBytes(length)
  let code = ''

  for (let i = 0; i < length; i++) {
    const index = bytes[i] % chars.length
    code += chars[index]
  }

  return code
}

