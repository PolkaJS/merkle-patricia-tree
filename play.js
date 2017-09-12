const MerklePatricia = require('./lib/MerklePatricia').default;
const levelup = require('levelup');
const RLP = require('@polkajs/rlp');

// const MP = new MerklePatricia();
//
// console.log("BEGIN 1");
// MP.update(Buffer.from('6f3254', 'hex'), 'cat', (err, hash) => {
//   console.log("HASH1", hash);
//   console.log("BEGIN 2");
//   MP.update(Buffer.from('6f5785', 'hex'), 'dog', (err, hash) => {
//     console.log("HASH2", hash);
//     console.log("BEGIN 3");
//     MP.update(Buffer.from('6f77', 'hex'), 'turtle', (err, hash) => {
//       console.log("HASH3", hash);
//     });
//     // MP.update(Buffer.from('6154', 'hex'), 'turtle', (err, hash) => {
//     //   console.log("HASH3", hash);
//     // });
//   });
// });


let db = levelup('./db/');

// db.get('3e81d1eb3c96e1a8dea9cfb273c86371c6d6bf7f70e8c7bd6f107c2cab44bf2c', (err, value) => {
//   let dec = RLP.decode(Buffer.from(value, 'hex'));
//   console.log('dec[0]', dec[0]);
//   console.log('dec[1]', dec[1].toString());
// });

db.get('c87c453382a69a3c10091924ea024d707c64ad0bf4e91252ddddb00a978d2358', (err, value) => {
  let dec = RLP.decode(Buffer.from(value, 'hex'));
  console.log(dec);
  // let decBranch = RLP.decode(dec[5]);
  console.log(dec[15].toString());
});
