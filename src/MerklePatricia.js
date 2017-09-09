// @flow

import DB       from './db'; // $FlowFixMe
import SHA3     from 'sha3';

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
  root: null | string;
  rootNode: Array<number>;
  constructor(root?: string) {
    super();
    const self = this;

    // set the root hash:
    self.root = (root) ? root : BLANK_ROOT;
    // prep a node
    self.rootNode = [];
  }

  update(key: string | Buffer, value: string | Buffer): null | string | Buffer {
    const self = this;
    let newKey = toNibbles(key);
    // improper length
    if (!key || key.length > 32) {
      return null;
    }
    if (!value || !value.length) self.deleteKey(self.root, newKey, value);

    let node = new Buffer(0);
    if (self.root) {
      // Root exists so lets get the node
      self.db.get(self.root, (err, node) => {
        if (err) return err;
        // unpack
        node = self._decodeNode(node);
        node[0] = toNibbles(node[0]);
        self.root = self._update(node, newKey, value);
        return self.root;
      });
    }
    // Otherwise root hash is empty; add a hex prefix
    newKey = self.addHexPrefix(newKey, true);
    node = RLP.encode([nibblesToBuffer(newKey), value]);
    self.root = self.createHash(node);
    self.db.put(self.root, node);
    return self.root;
  }

  _getNodeType(node: Array<any>): number | null {
    if (!node)
      return NODE_TYPE.BLANK;
    if (node.length === 2) {
      // if terminator than leaf else extension
      if (node[0][0] === 2 || node[0][0] === 3)
        return NODE_TYPE.LEAF;
      else
        return NODE_TYPE.EXTENSION;
    }
    if (node.length === 17)
      return NODE_TYPE.BRANCH;
    return null;
  }

  _addToBranch(branch: Array<Array<any>>, key: Array<number>, value: string | Buffer): Array<Array<number>> {
    if (!key.length)
      branch[-1] = [null, value];
    else
      branch[key[0]] = [this.addHexPrefix(key.slice(1), true), value];
    return branch;
  }

  _update(node: Array<any>, key: Array<number>, value: string | Buffer): string {
    const self = this;
    const nodeType = self._getNodeType(node);
    let prefix = [];
    if (nodeType === NODE_TYPE.LEAF || NODE_TYPE.EXTENSION) {
      node[0] = self.removeHexPrefix(node[0]); // $FlowFixMe
      [prefix, node[0], key] = self._nodeUnshift(node[0], key);
    }
    if (nodeType === NODE_TYPE.LEAF
              || (nodeType === NODE_TYPE.EXTENSION && node[0].length)) {
      let branch = new Array(17);
      branch = self._addToBranch(branch, key, value);
      branch = self._addToBranch(branch, node[0], node[1]);
      if (!prefix.length) {
        node = branch
      } else {
        // create and store branch
        let hash = self.createHash(RLP.encode(branch));
        self.db.put(hash, branch);
        node = [self.addHexPrefix(prefix), hash];
      }
    } else if (nodeType === NODE_TYPE.BRANCH) {
      // add to branch; but if the branch has a value there already, split
      if (!node[key[0]])
        node[key[0]] = [self.addHexPrefix(key.slice(1)), value];
      else
        node[key[0]] = self._update(node[key[0]], key.slice(1), value);
    } else if (nodeType === NODE_TYPE.EXTENSION) { // we have key values left over in the key but node_key (node[0]) is empty
      // we dive deeper into the beast
      self.db.get(node[1], (err, newNode) => {
        if (err) return err;
        // unpack
        newNode    = self._decodeNode(newNode);
        newNode[0] = toNibbles(newNode[0]);
        // Update hash to the new node
        node[1] = self._update(newNode, key, value);
      });
    }
    node = RLP.encode(node);
    let hash = self.createHash(node);
    self.db.put(hash, node);
    return hash;
  }

  _nodeUnshift(nodeKey: Array<number>, key: Array<number>): Array<Array<number>> {
    // lets get the shared values of nodeKey and key:
    let length   = (nodeKey.length > key.length) ? key.length : nodeKey.length;
    let leftSize = 0;
    while (nodeKey[leftSize] === key[leftSize])
      leftSize++;
    return [key.slice(0, leftSize), nodeKey.slice(leftSize), key.slice(leftSize)]; // [left slice, right slice of node, right slice of key]
  }

  _decodeNode(node: Array<any>): Array<any> { // input is really a Buffer... thanks flow.
    let decoded = RLP.decode(node);
    return [decoded[0].toString('hex'), decoded[1].toString()];
  }

  deleteKey(node: any, key: Array<number>, value: string | Buffer) {

  }

  _deleteNode(node: Array<number>) {
    if (!node.length)
      return;
    let encoded = self._encodeNode(node);
    if (encoded.length < 32)
        return
    self.db.delete(encoded);
  }

  _encodeNode(node: Array<number>): string | null {
    if (!node.length)
      return BLANK_NODE;
    let rlp = RLP.encode(node);
    if (rlp.length < 32)
      return node.join('');
    let hashkey = this.createHash(rlp)
    self.db.put(hashkey, rlp);
    return hashkey;
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
    return new SHA3.SHA3Hash(256).update(payload).digest('hex');
  }
}

function toNibbles(s: Buffer | string): Array<number> {
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
  if (!Buffer.isBuffer(s)) { // $FlowFixMe
    s = Buffer.from(s, 'hex');
  }
  let result = [];
  while (s.length) { // $FlowFixMe
    result.push(s.readUInt8(0) >> 4); // assuming 'h' or '68', this will return the first four bits or '6' $FlowFixMe
    result.push(s.readUInt8(0) & 15); // and this will return the last 4 bits or '8'
    s = s.slice(1);                   // remove the two nibbles
  }
  return result;
}

function nibblesToBuffer(arr: Array<number>): Buffer {
  let buf = new Buffer(arr.length / 2)
  for (let i = 0; i < buf.length; i++) {
    let q = i * 2
    buf[i] = (arr[q] << 4) + arr[++q]
  }
  return buf
}

export default MerklePatricia;
