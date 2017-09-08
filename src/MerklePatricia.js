// @flow

import DB       from './db';
import util     from './util';

const RLP = require('@polkajs/rlp');

const BLANK_NODE        = null;
const BLANK_ROOT        = null;
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

  update(key: string | Buffer, value: string | Buffer): null | string {
    const self = this;
    const newKey = self.addHexPrefix(util.toNibbles(key), true);

    if (!key || key.length > 32) {
      return null;
    }

    // let node = '';
    // if (self.root) {
    //   // Root exists so lets get the node
    //   const newValue = RLP.encode(value);
    //   let node = self.db.get(self.root);
    //   (!value || !value.length)
    //     ? self.deleteKey(node, newKey, value)
    //     : self.traverseTree(node, newKey, value);
    // } else {
    //   // Root hash is empty
    //   console.log("newKey", newKey.toString());
    //   node = RLP.encode([newKey.toString(), value]).toString('hex');
    //   console.log("node", node);
    //   self.db.put(self.createRoot(node), node);
    // }

    self.rootNode = self._updateAndDelete(self.rootNode, util.toNibbles(key), value);
    return self.root;
  }

  _getNodeType(node: Array<number> | null): number | null {
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

  _updateAndDelete(node: Array<number>, key: Array<number>, value: string | Buffer): Array<number> {
    const oldNode = node.slice();
    const newNode = this._update(node, key, value);
    if (oldNode !== newNode)
      self._deleteNode(oldNode);
    return newNode;
  }

  _update(node: Array<number>, key: Array<number>, value: string | Buffer): Array<number> {
    let nodeType = self._getNodeType(node);
    if (nodeType === NODE_TYPE.BLANK)
      return [util.toNibbles(key), RLP.encode(value)];
    if (nodeType === NODE_TYPE.BRANCH) {
      // TODO
      if (!key) {
        node[-1] = RLP.encode(value);
      } else {
        let newNode = this._updateAndDelete(node[0], key.slice(1), value);
        node[0] = self._encodeNode(newNode);
      }
      return node;
    }
    if (nodeType === NODE_TYPE.LEAF || nodeType === NODE_TYPE.EXTENSION)
      return self._updateKVnode(node, key, value);
    return [];
  }

  _updateKVnode(node: Array<number>, key: Array<number>, value: string | Buffer): Array<number> {
    // TODO
    return [];
  }

  traverseTree(node: any, key: Array<number>, value: string | Buffer) {

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

  createRoot(payload: string | Buffer): string {
    return this.root = util.sha3(payload, 'hex');
  }
}

export default MerklePatricia;
