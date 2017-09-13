// @flow
import { Duplex } from "stream";
import RLP        from '@polkajs/rlp';
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

  _put(hash: string, node: Buffer, cb: Function) {
    this.db.put(hash, node.toString('hex'), (err) => {
      if (err) cb(err);
      cb(null, hash, node);
    });
  }

  _get(hash: string, cb: Function) {
    this.db.get(hash, (err, value) => {
      if (err) cb(err);
      cb(null, RLP.decode(Buffer.from(value, 'hex')));
    });
  }

  _delete(hash: string, cb: Function) {
    this.db.delete(hash, (err) => {
      if (err) cb(err);
      cb(null);
    })
  }

  // [ ['0x1a4...df2', { block data }], ['0xcb1...bb5', { block data }], ... ]
  _batchPut(hashValuePairs: Array<Array<mixed>>, cb: Function) {
    const hashes = hashValuePairs.map((hash) => {
      return { type: 'put', key: hash[0], value: hash[1] }
    });
    this.db.batch(hashes, (err) => {
      if (err) cb(err);
      cb(null);
    });
  }
}
