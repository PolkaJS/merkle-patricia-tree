// @flow
import { Duplex } from "stream";
import levelup    from 'levelup';

/****************************** ABOUT *********************************
 * In this case, we will be storing data using googles levelup
 * database. The key will be the blocks hash [doubleSha3(blockHeader)]
 * support for get, put, batch, del
 * blocks are stored as bencoded dictionary strings
 **********************************************************************/


export default class DB {
  db: levelup;
  constructor() {
    this.db = levelup('./db/');
  }

  put(hash: string, block: string) {
    this.db.put(hash, block, (err) => {
      if (err) return err;
      return null;
    });
  }

  get(hash: string, cb: Function) {
    this.db.get(hash, (err, value) => {
      if (err) return err;
      cb(null, value);
    });
  }

  delete(hash: string, cb: Function) {
    this.db.delete(hash, (err) => {
      if (err) return err;
      cb(null);
    })
  }

  // [ ['0x1a4...df2', { block data }], ['0xcb1...bb5', { block data }], ... ]
  batchPut(hashValuePairs: Array<Array<mixed>>) {
    const hashes = hashValuePairs.map((hash) => {
      return { type: 'put', key: hash[0], value: hash[1] }
    });
    this.db.batch(hashes, (err) => {
      if (err) return err;
      return null;
    });
  }
}