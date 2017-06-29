import SHA3 from 'sha3';

export function sha3(payload: string | Buffer): string {
  return new SHA3.SHA3Hash(256).update(payload).digest();
}

export const SHA3_NULL = '56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421';

export const SHA3_NULL_BUFFER = Buffer.from(SHA3_NULL, 'hex');
