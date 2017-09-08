import SHA3 from 'sha3';

export function sha3(payload: string | Buffer, type?: string): string {
  return new SHA3.SHA3Hash(256).update(payload).digest(string);
}

export const SHA3_NULL = '56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421';

export const SHA3_NULL_BUFFER = Buffer.from(SHA3_NULL, 'hex');

export function toNibbles(s: Buffer | string): Array<number> {
  /**
    * > bin_to_nibbles("")
    * []
    * > bin_to_nibbles("h")
    * [6, 8]
    * > bin_to_nibbles("he")
    * [6, 8, 6, 5]
    * > bin_to_nibbles("hello")
    * [6, 8, 6, 5, 6, 12, 6, 12, 6, 15]
    **/
  if (!Buffer.isBuffer(s)) {
    s = Buffer.from(s);
  }
  let result = [];
  while (s.length) { // $FlowFixMe
    result.push(s.readUInt8(0) >> 4); // assuming 'h' or '65', this will return the first four bits $FlowFixMe
    result.push(s.readUInt8(0) & 15); // and this will return the last 4
    s = s.slice(1);                   // take the two nibbles out
  }
  return result;
}

export function nibblesToBuffer(arr: Array<number>): Buffer {
  let buf = new Buffer(arr.length / 2)
  for (let i = 0; i < buf.length; i++) {
    let q = i * 2
    buf[i] = (arr[q] << 4) + arr[++q]
  }
  return buf
}
