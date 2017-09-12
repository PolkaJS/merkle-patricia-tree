# merkle-patricia-tree [![travis][travis-image]][travis-url] [![npm][npm-image]][npm-url] [![downloads][downloads-image]][downloads-url] [![Greenkeeper badge](https://badges.greenkeeper.io/PolkaJS/merkle-patricia-tree.svg)](https://greenkeeper.io/)

[travis-image]: https://travis-ci.org/PolkaJS/merkle-patricia-tree.svg?branch=master
[travis-url]: https://travis-ci.org/PolkaJS/merkle-patricia-tree
[npm-image]: https://img.shields.io/npm/v/@polkajs/merkle-patricia-tree.svg
[npm-url]: https://npmjs.org/package/@polkajs/merkle-patricia-tree
[downloads-image]: https://img.shields.io/npm/dm/@polkajs/merkle-patricia-tree.svg
[downloads-url]: https://npmjs.org/package/@polkajs/merkle-patricia-tree

## About

Merkle Patricia trees provide a cryptographically authenticated data structure that can be used to store all (key, value) bindings, although for the scope of this paper we are restricting keys and values to strings (to remove this restriction, just use any serialization format for other data types). They are fully deterministic, meaning that a Patricia tree with the same (key,value) bindings is guaranteed to be exactly the same down to the last byte and therefore have the same root hash, provide the holy grail of O(log(n)) efficiency for inserts, lookups and deletes, and are much easier to understand and code than more complex comparison-based alternatives like red-black trees.

## Further Reading

[Ethereum Patricia Tree](https://github.com/ethereum/wiki/wiki/Patricia-Tree)

[blog post](https://blog.ethereum.org/2015/11/15/merkling-in-ethereum/)

[Understanding the Ethereum Trie](https://easythereentropy.wordpress.com/2014/06/04/understanding-the-ethereum-trie/)

## Example
```js
const MerklePatricia = require('@polkajs/merkle-patricia-tree').default;

const MP = new MerklePatricia();

MP.update(Buffer.from('6f3254', 'hex'), 'cat', (err, hash) => {
  console.log("HASH1", hash); // 65869c16e2b12917ce52b143349a6faa7e08cb3f8da499aeca619adbe7ffe9db
  MP.update(Buffer.from('6f5785', 'hex'), 'dog', (err, hash) => {
    console.log("HASH2", hash); // ce79f3b52eb8717a6cfaa1a35acb09ef42acf21be030e3a10c7992f377a24e65
    MP.get(Buffer.from('6f5785', 'hex'), (err, value) => {
      console.log("value", value); // dog
    });
  });
});
```

## API

### constructor(root?: string): MerklePatricia

### get(key: string | Buffer, cb: Function)
* key: a hex representation of the location within the trie
* cb: **(err, value)**
  - err: if an error it will return a value, otherwise null
  - value: a string of the value stored

### createHash(payload: string | Buffer): string
* payload: input
* **return** a hex string representation of the hash


## ISC License (ISC)

Copyright 2017 <Zion Coin>
Copyright (c) 2004-2010 by Internet Systems Consortium, Inc. ("ISC")
Copyright (c) 1995-2003 by Internet Software Consortium


Permission to use, copy, modify, and/or distribute this software for any purpose with or without fee is hereby granted, provided that the above copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
