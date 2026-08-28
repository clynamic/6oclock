import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

interface Cipher {
  seal: (plaintext: string) => string;
  open: (value: string) => string;
}

const KEY_FILE = '.session-key';

let dataDir: string;

const loadCipher = (): Cipher => {
  let cipher!: Cipher;
  jest.isolateModules(() => {
    cipher = jest.requireActual('./secret-cipher') as Cipher;
  });
  return cipher;
};

beforeEach(() => {
  dataDir = fs.mkdtempSync(path.join(os.tmpdir(), 'secret-cipher-'));
  process.env['DATA_DIR'] = dataDir;
});

afterEach(() => {
  delete process.env['DATA_DIR'];
  fs.rmSync(dataDir, { recursive: true, force: true });
});

describe('secret cipher', () => {
  it('opens what it sealed', () => {
    const { seal, open } = loadCipher();

    expect(open(seal('a refresh token'))).toBe('a refresh token');
  });

  it('carries an empty value through unchanged', () => {
    const { seal, open } = loadCipher();

    expect(open(seal(''))).toBe('');
  });

  it('carries text outside ascii through unchanged', () => {
    const { seal, open } = loadCipher();

    expect(open(seal('ключ 🔑'))).toBe('ключ 🔑');
  });

  it('seals the same text differently every time', () => {
    const { seal, open } = loadCipher();

    const first = seal('same');
    const second = seal('same');

    expect(first).not.toBe(second);
    expect(open(first)).toBe('same');
    expect(open(second)).toBe('same');
  });

  it('refuses a sealed value whose body was altered', () => {
    const { seal, open } = loadCipher();

    const blob = Buffer.from(seal('a refresh token'), 'base64');
    blob[blob.length - 1] = blob[blob.length - 1]! ^ 0xff;

    expect(() => open(blob.toString('base64'))).toThrow();
  });

  it('refuses a sealed value whose tag was altered', () => {
    const { seal, open } = loadCipher();

    const blob = Buffer.from(seal('a refresh token'), 'base64');
    blob[13] = blob[13]! ^ 0xff;

    expect(() => open(blob.toString('base64'))).toThrow();
  });

  it('refuses a blob too short to hold an iv and a tag', () => {
    const { seal, open } = loadCipher();

    const blob = Buffer.from(seal('a refresh token'), 'base64');

    expect(() => open(blob.subarray(0, 20).toString('base64'))).toThrow();
  });

  it('refuses a value whose shape was never a sealed blob', () => {
    const { open } = loadCipher();

    expect(() => open('not base64 at all')).toThrow();
  });

  it('writes a key on first use and reuses it afterwards', () => {
    const first = loadCipher();
    const sealed = first.seal('a refresh token');
    const written = fs.readFileSync(path.join(dataDir, KEY_FILE));

    const second = loadCipher();

    expect(written).toHaveLength(32);
    expect(second.open(sealed)).toBe('a refresh token');
    expect(fs.readFileSync(path.join(dataDir, KEY_FILE))).toEqual(written);
  });

  it('replaces a key file of the wrong length, orphaning what it sealed', () => {
    const first = loadCipher();
    const sealed = first.seal('a refresh token');

    fs.writeFileSync(path.join(dataDir, KEY_FILE), Buffer.alloc(16));
    const second = loadCipher();
    second.seal('anything, to make it reach for the key');

    expect(fs.readFileSync(path.join(dataDir, KEY_FILE))).toHaveLength(32);
    expect(() => second.open(sealed)).toThrow();
  });

  it('cannot open what another key sealed', () => {
    const first = loadCipher();
    const sealed = first.seal('a refresh token');

    fs.rmSync(path.join(dataDir, KEY_FILE));
    const second = loadCipher();

    expect(() => second.open(sealed)).toThrow();
  });
});
