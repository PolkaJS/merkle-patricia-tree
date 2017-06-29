// const MerklePatricia = require('./lib/MerklePatricia').default;
const SHA3 = require('sha3');
const rlp  = require('@polkajs/rlp');
const createKeccakHash = require('keccak')
// //
let x = rlp.encode([Buffer.from('2064657374', 'hex'), '6f6e65'])
// //
console.log(x);
let sha = new SHA3.SHA3Hash(256).update(x).digest('hex');
// let sha2 = createKeccakHash('keccak' + 256).update(x).digest();
// //
console.log(sha);
// console.log(sha2);
// // const fs = require('fs');
// //
// // fs.readFile('./000008.ldb', 'hex', (err, result) => {
// //   console.log(result);
// // });
//
// // 281463efbfbd33efbfbd6befbfbdefbfbd4b396d38efbfbd47760d1651efbfbd18efbfbdefbfbd6d7cefbfbdefbfbd02efbfbd34efbfbd38efbfbd310101000000000000d38a20010102010102010102efbfbdc6857374617274000000000100000000efbfbdefbfbd2127000000000100000000efbfbdefbfbdefbfbdefbfbd0009026401efbfbdefbfbdefbfbdefbfbdefbfbdefbfbdefbfbd00470000000001000000001eefbfbdefbfbd2e4c08591600000000000000000000000000000000000000000000000000000000000000000000000057efbfbdefbfbdefbfbd247547efbfbd0d
//
// // c7dfae4d430001010000000000000001000000012063bd33e46bb8c74b396d38dc47760d1651f818e2b36d7cf1ea02d634a4388d3114d38a2001010201010201010287c6857374617274
// // 63bd33e46bb8c74b396d38dc47760d1651f818e2b36d7cf1ea02d634a4388d31
// // deddf10aad531de8fa36e9c8c4823347cee57ca5de285593f15be4328ef1ff00


// const util = require('./lib/util');
// console.log(util.SHA3_NULL_BUFFER);
