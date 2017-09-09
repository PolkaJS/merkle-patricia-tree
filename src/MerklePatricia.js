// @flow

import DB       from './db';
import util     from './util';

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
// type NODE_TYPE = {
//   BLANK:     null,                   // null
//   LEAF:      string | Array<string>, // ['\x02', '\xc6\x85start'] or '\xc6\x85start'
//   EXTENSION: Array<string>,          // ['\x10\x10\x10', 'ci\xd6f\t\xf3\xfc\x81\x17\x04$\x87\xe5\xf1\x16\x95A\xe9\xec-W"<Y\x80~H\xccR!\xde\xfd'] OR OR ':\x08\xca5\x80\x1b\xfd7\xa6,\xac\xca-\xfb\xd1\xc3\xa4DBL\xce1\x97\xe8\xe9\xfc\x13"\n\x19uJ'
//   BRANCH:    Array<Array<string>>    // ['', '', [' ', '\xc6\x85start'], '', '', '', '', '', '', [' ', '\xc4\x83cat'], '', '', '', '', [' \x03', '\xc9\x88dog-deep'], '', '']
// }
const NODE_TYPE = {
  BLANK:     0,                   // null
  LEAF:      1, // ['\x02', '\xc6\x85start'] or '\xc6\x85start'
  EXTENSION: 2,          // ['\x10\x10\x10', 'ci\xd6f\t\xf3\xfc\x81\x17\x04$\x87\xe5\xf1\x16\x95A\xe9\xec-W"<Y\x80~H\xccR!\xde\xfd'] OR OR ':\x08\xca5\x80\x1b\xfd7\xa6,\xac\xca-\xfb\xd1\xc3\xa4DBL\xce1\x97\xe8\xe9\xfc\x13"\n\x19uJ'
  BRANCH:    3    // ['', '', [' ', '\xc6\x85start'], '', '', '', '', '', '', [' ', '\xc4\x83cat'], '', '', '', '', [' \x03', '\xc9\x88dog-deep'], '', '']
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
    let newKey = util.toNibbles(key);
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
        node = RLP.decode(node);
        node[0] = util.toNibbles(node[0]);
        let newNode = self._update(node, newKey, value);
        // if (newNode != node)
        //   self.db.delete(node);
        node = newNode;
      });
    } else {
      // Root hash is empty; add a hex prefix
      newKey = self.addHexPrefix(newKey, true);
      node = RLP.encode([util.nibblesToBuffer(newKey), value]);
    }
    self.root = self.createRoot(node);
    self.db.put(self.root, node);
    return node;
  }

  _getNodeType(node: Array<number>): number | null {
    if (!node)
      return NODE_TYPE.BLANK;
    if (node.length === 2) {
      // if terminator than leaf else extension
      if (node[0] === 2 || node[0] === 3)
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

  _update(node: Array<any>, key: Array<number>, value: string | Buffer): Buffer {
    const self = this;
    const nodeType = self._getNodeType(node[0]);
    let prefix;
    [prefix, node[0], key] = self._nodeUnshift(node[0], key);
    if (nodeType === NODE_TYPE.LEAF) {
      // check if matching prefix
      let branch = new Array(17);
      branch = self._addToBranch(branch, key, value);
      branch = self._addToBranch(branch, node[0], node[1]);
      if (!prefix.length) {
        node = branch
      } else {
        let hash = self.createRoot(RLP.encode(branch));
        self.db.put(hash, node);
        node = [self.addHexPrefix(prefix), hash];
      }
    } else if (nodeType === NODE_TYPE.BRANCH) {
      // add to branch; but if the branch has a value there already, split

    } else if (nodeType === NODE_TYPE.EXTENSION) {
      // if an extension and they match
      self.db.get(node[1], (err, newNode) => {
        if (err) return err;
        // unpack
        newNode    = RLP.decode(newNode);
        newNode[0] = util.toNibbles(newNode[0]);
        // let leftover;
        // [leftover, newNode, key] = self._update(newNode, self._nodeUnshift(newNode[0], key), value);
      });
      // if an extension and length is 1 create branch

    }
    node = RLP.encode(node);
    let hash = self.createRoot(node);
    self.db.put(hash, node);
    return new Buffer(0);
  }

  _nodeUnshift(nodeKey: Array<number>, key: Array<number>): Array<Array<number>> {
    // lets get the shared values of nodeKey and key:
    let length   = (nodeKey.length > key.length) ? key.length : nodeKey.length;
    let leftSize = 0;
    while (nodeKey[leftSize] === key[leftSize])
      leftSize++;
    return [key.slice(0, leftSize), nodeKey.slice(leftSize), key.slice(leftSize)]; // [left slice, right slice of node, right slice of key]
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
    let hashkey = util.sha3(rlp)
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

  createRoot(payload: string | Buffer): string {
    return this.root = util.sha3(payload, 'hex');
  }
}

export default MerklePatricia;
