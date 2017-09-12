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
//     MP.update(Buffer.from('6f59', 'hex'), 'turtle', (err, hash) => {
//       console.log("HASH3", hash);
//     });
//     // MP.update(Buffer.from('6154', 'hex'), 'turtle', (err, hash) => {
//     //   console.log("HASH3", hash);
//     // });
//   });
// });


let db = levelup('./db/');

// db.get('32da2312b1ed5801b29fcb9c2e0dd20a2dbb4cd7c088590d8e015cbf255de204', (err, value) => {
//   let dec = RLP.decode(Buffer.from(value, 'hex'));
//   console.log('dec[0]', dec[0]);
//   console.log('dec[1]', dec[1].toString());
// });

db.get('7d5c5564daa19c4c55015cd274b8a0a2dfd485f56641d602ce40a2793a15dfa6', (err, value) => {
  let dec = RLP.decode(Buffer.from(value, 'hex'));
  console.log(dec);
  // let decBranch = RLP.decode(dec[5]);
  // console.log(decBranch[1].toString());
  // console.log(dec[5].toString());
});
