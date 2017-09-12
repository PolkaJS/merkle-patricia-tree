// @flow

import DB     from './db';
import Keccak from 'keccak';
import chalk  from 'chalk';

const RLP = require('@polkajs/rlp');

const BLANK_NODE        = '';
const BLANK_ROOT        = '';
const NIBBLE_TERMINATOR = 16;

/**
  * NODE TYPES:
  * BLANK nodes will either be a '' or null and represent an empty slot in a BRANCH
  * LEAF nodes are used to represent data (value), if you're in a BRANCH,
  * the value will be the 17th position and look like '\xc6\x85start'
  * EXTENSION nodes represent an address lookup for the DB
  * BRANCH nodes are of length 17 and contain BLANKs, LEAFs, and EXTENSIONS
  **/
const NODE_TYPE = {
  BLANK:     0,    // null
  LEAF:      1,    // ['\x02', '\xc6\x85start'] or '\xc6\x85start'
  EXTENSION: 2,    // ['\x10\x10\x10', 'ci\xd6f\t\xf3\xfc\x81\x17\x04$\x87\xe5\xf1\x16\x95A\xe9\xec-W"<Y\x80~H\xccR!\xde\xfd'] OR OR ':\x08\xca5\x80\x1b\xfd7\xa6,\xac\xca-\xfb\xd1\xc3\xa4DBL\xce1\x97\xe8\xe9\xfc\x13"\n\x19uJ'
  BRANCH:    3     // ['', '', [' ', '\xc6\x85start'], '', '', '', '', '', '', [' ', '\xc4\x83cat'], '', '', '', '', [' \x03', '\xc9\x88dog-deep'], '', '']
}

class MerklePatricia extends DB {
  root: string;
  rootNode: Array<number>;
  constructor(root?: string) {
    super();
    const self = this;

    // set the root hash:
    self.root = (root) ? root : BLANK_ROOT;
  }

  get(key: string | Buffer, cb: Function) {
    this._get(this.root, (err, node) => {
      this._getValue(node, toNibbles(key), cb);
    });
  }

  _getValue(node: Array<any>, key: Array<number>, cb: Function) {
    const self = this;
    const nodeType = self._getNodeType(node);
    if (nodeType === NODE_TYPE.LEAF) {
      let prefix = []; // $FlowFixMe
      [prefix, node[0], key] = self._nodeUnshift(node[0], key);
      if (!node[0].length)
        cb(null, node[0]);
      else
        cb("node not found");
    } else if (nodeType === NODE_TYPE.BRANCH) {
      let prefix = key.slice(0, 1); // $FlowFixMe
      self._getValue(node[prefix], key, cb);
    } else if (nodeType === NODE_TYPE.EXTENSION) {
      let prefix = []; // $FlowFixMe
      [prefix, node[0], key] = self._nodeUnshift(node[0], key);
      self._get(node[1], (err, newNode) => {
        if (err) cb(err);
        self._getValue(newNode, key, cb);
      });
    } else {
      cb("node not found");
    }
  }

  update(key: string | Buffer, value: string | Buffer, cb: Function) {
    const self = this;
    let newKey = toNibbles(key);
    // improper length
    if (!key || key.length > 32) {
      cb("Invalid key length");
    }

    let node = new Buffer(0);
    if (self.root) {
      // Root exists so lets get the node
      self._get(self.root, (err, node) => {
        if (err) cb(err);
        self._update(node, newKey, value, (err, hash) => {
          self.root = hash;
          cb(null, self.root);
        });
      });
    } else {
      // Otherwise root hash is empty; add a hex prefix
      newKey = self.addHexPrefix(newKey, true);
      node = RLP.encode([nibblesToBuffer(newKey), value]);
      self.root = self.createHash(node);
      self._put(self.root, node, cb);
    }
  }

  _getNodeType(node: Array<any>): number | null {
    if (!node)
      return NODE_TYPE.BLANK;
    if (node.length === 2) {
      // if terminator than leaf else extension
      if (node[0][0] & 32)
        return NODE_TYPE.LEAF;
      else
        return NODE_TYPE.EXTENSION;
    }
    if (node.length === 17)
      return NODE_TYPE.BRANCH;
    return null;
  }

  _update(node: Array<any>, key: Array<number>, value: string | Buffer, cb: Function) {
    const self = this;
    const nodeType = self._getNodeType(node);
    if (nodeType === NODE_TYPE.LEAF || nodeType === NODE_TYPE.EXTENSION) {
      // unpack
      node[1] = node[1].toString();
      node[0] = toNibbles(node[0]);
      self._leafExtension(node, nodeType, key, value, cb);
    } else if (nodeType === NODE_TYPE.BRANCH) {
      // add to branch; but if the branch has a value there already, split
      if (!node[key[0]] || !node[key[0]].length) {
        node[key[0]] = [nibblesToBuffer(self.addHexPrefix(key.slice(1), true)), value];
        self._updateDB(node, cb);
      } else {
        if (!Array.isArray(node[key[0]])) // unique case, RLP does not decode deep arrays
          node[key[0]] = RLP.decode(node[key[0]]);
        self._update(node[key[0]], key.slice(1), value, (err, hash, newNode) => {
          node[key[0]] = newNode;
          self._updateDB(node, cb);
        });
      }
    } else {
      cb("invalid node");
    }
  }

  _updateDB(node: Array<any>, cb: Function) {
    node = RLP.encode(node);
    let hash = this.createHash(node);
    this._put(hash, node, cb);
  }

  _leafExtension(node: Array<any>, type: number | null, key: Array<number>, value: string | Buffer, cb: Function) {
    const self = this;
    let prefix = [];
    node[0] = self.removeHexPrefix(node[0]); // $FlowFixMe
    [prefix, node[0], key] = self._nodeUnshift(node[0], key);
    if (type === NODE_TYPE.LEAF || (type === NODE_TYPE.EXTENSION && node[0].length)) { // ************
      // create a branch and return an extension pointing to that branch
      let branch = new Array(17).fill(null);
      branch = self._addToBranch(branch, key, value, true);
      branch = self._addToBranch(branch, node[0], node[1], type === NODE_TYPE.LEAF);
      self._updateDB(branch, (err, hash) => {
        if (err) cb(err);
        node = [nibblesToBuffer(self.addHexPrefix(prefix)), hash];
        self._updateDB(node, cb);
      });
    } else { // (type === NODE_TYPE.EXTENSION) we have key values left over in the key but node_key (node[0]) is empty
      // we dive deeper into the belly of the beast
      self._get(node[1], (err, newNode) => {
        if (err) cb(err);
        // Update hash to the new node
        self._update(newNode, key, value, (err, hash) => {
          node = [nibblesToBuffer(self.addHexPrefix(prefix)), hash];
          self._updateDB(node, cb);
        });
      });
    }
  }

  _addToBranch(branch: Array<any>, key: Array<number>, value: string | Buffer, terminator: bool): Array<Array<number>> {
    if (!key.length)
      branch[-1] = value;
    else
      branch[key[0]] = [nibblesToBuffer(this.addHexPrefix(key.slice(1), terminator)), value];
    return branch;
  }

  _nodeUnshift(nodeKey: Array<number>, key: Array<number>): Array<Array<number>> {
    // lets get the shared values of nodeKey and key:
    let length   = (nodeKey.length > key.length) ? key.length : nodeKey.length;
    let leftSize = 0;
    while (nodeKey[leftSize] === key[leftSize])
      leftSize++;
    return [key.slice(0, leftSize), nodeKey.slice(leftSize), key.slice(leftSize)]; // [left slice, right slice of node, right slice of key]
  }

  addHexPrefix(key: Array<number>, terminator?: bool = false): Array<number> {
    let HP = 0;

    if (terminator)
      HP += 2; // LEAF TYPE
    if (key.length % 2 !== 0)
      HP += 1; // uneven
    else
      key.unshift(0); // maintain equal amount of zeros

    key.unshift(HP);
    return key;
  }

  removeHexPrefix(key: Array<number>): Array<number> {
    if (key[0] === 0 || key[0] === 2) {
      return key.slice(2);
    }
    return key.slice(1);
  }

  createHash(payload: string | Buffer): string {
    return new Keccak('keccak256').update(payload).digest('hex');
  }
}

function toNibbles(s: Buffer | string): Array<number> {
  /** > bin_to_nibbles("")
    * []
    * > bin_to_nibbles("h")
    * [6, 8]
    * > bin_to_nibbles("hello")
    * [6, 8, 6, 5, 6, 12, 6, 12, 6, 15]
    **/
  if (!Buffer.isBuffer(s)) {
    s = Buffer.from(s);
  }
  let result = [];
  while (s.length) { // $FlowFixMe
    result.push(s.readUInt8(0) >> 4); // assuming 'h' or '68', this will return the first four bits or '6' $FlowFixMe
    result.push(s.readUInt8(0) & 15); // and this will return the last 4 bits or '8'
    s = s.slice(1);                   // remove the two nibbles
  }
  return result;
}

function nibblesToBuffer(arr: Array<number> | null): Buffer {
  if (!arr) return new Buffer(0);
  let buf = new Buffer(arr.length / 2)
  for (let i = 0; i < buf.length; i++) {
    let q = i * 2
    buf[i] = (arr[q] << 4) + arr[++q]
  }
  return buf
}

export default MerklePatricia;
