import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';
import fs from 'node:fs';
import { join } from 'node:path';

const ALGO = 'aes-256-gcm';
const IV_BYTES = 12;
const TAG_BYTES = 16;

let cachedKey: Buffer | null = null;

const key = (): Buffer => {
  if (cachedKey) return cachedKey;
  const file = join(process.env['DATA_DIR'] ?? './data', '.session-key');
  let raw: Buffer;
  try {
    raw = fs.readFileSync(file);
    if (raw.length !== 32) throw new Error('invalid key');
  } catch {
    raw = randomBytes(32);
    fs.writeFileSync(file, raw);
  }
  cachedKey = raw;
  return raw;
};

export const seal = (plaintext: string): string => {
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGO, key(), iv);
  const body = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, body]).toString('base64');
};

export const open = (value: string): string => {
  const blob = Buffer.from(value, 'base64');
  const iv = blob.subarray(0, IV_BYTES);
  const tag = blob.subarray(IV_BYTES, IV_BYTES + TAG_BYTES);
  const body = blob.subarray(IV_BYTES + TAG_BYTES);
  const decipher = createDecipheriv(ALGO, key(), iv);
  decipher.setAuthTag(tag);
  return decipher.update(body, undefined, 'utf8') + decipher.final('utf8');
};
