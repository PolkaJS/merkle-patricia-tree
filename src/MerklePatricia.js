// @flow

import DB   from './db';
import SHA3 from 'sha3';
import RPL  from '@polkajs/rlp';

const BLANK_NODE = null;
const BLANK_ROOT = null;

/**
  * NODE TYPES:
  * BLANK nodes will either be a '' or null and represent an empty slot in a BRANCH
  * LEAF nodes are used to represent data (value), if you're in a BRANCH,
  * the value will be the 17th position and look like '\xc6\x85start'
  * EXTENSION nodes represent an address lookup for the DB
  * BRANCH nodes are of length 17 and contain BLANKs, LEAFs, and EXTENSIONS
  **/
interface NODE_TYPE {
  BLANK:     null,                   // null
  LEAF:      string | Array<string>, // ['\x02', '\xc6\x85start'] or '\xc6\x85start'
  EXTENSION: Array<string>,          // ['\x10\x10\x10', 'ci\xd6f\t\xf3\xfc\x81\x17\x04$\x87\xe5\xf1\x16\x95A\xe9\xec-W"<Y\x80~H\xccR!\xde\xfd'] OR OR ':\x08\xca5\x80\x1b\xfd7\xa6,\xac\xca-\xfb\xd1\xc3\xa4DBL\xce1\x97\xe8\xe9\xfc\x13"\n\x19uJ'
  BRANCH:    Array<Array<string>>    // ['', '', [' ', '\xc6\x85start'], '', '', '', '', '', '', [' ', '\xc4\x83cat'], '', '', '', '', [' \x03', '\xc9\x88dog-deep'], '', '']
}

class MerklePatricia extends DB {
  DB:   typeof DB;
  root: null | string;
  node: Array<number>;
  constructor(db?: null | typeof DB, root?: string) {
    super();
    const self = this;

    if (typeof db === 'string') {
      root = db;
      db   = null;
    }

    // set the root hash:
    self.root = (root) ? root : BLANK_ROOT;
    // prep a node
    self.node = [];
  }

  addHexPrefix(key: Array<number>, terminator?: bool = false): null | Array<number> {
    let HP = 0;

    if (terminator)
      HP += 2; // EXTENSION TYPE
    if (key.length % 2 !== 0)
      HP += 1; // uneven
    else
      key.unshift(0); // maintain equal amount of zeros

    key.unshift(HP);
    return key;
  }

  createRoot(payload: string) {
    return new SHA3.SHA3Hash(256).update(payload).digest();
  }
}


// function num_to_hex_char(input: Array<number>): string {
//   const hex_char = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
//   if (typeof input === 'number')
//     input = [input];
//
//   input = input.map((n) => {
//     n = hex_char[n];
//   });
//
//   return input.join('');
// }

export default MerklePatricia;
