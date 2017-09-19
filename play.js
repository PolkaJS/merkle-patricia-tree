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
//     MP.update(Buffer.from('6f57', 'hex'), 'turtle', (err, hash) => {
//       console.log("HASH3", hash);
//       // MP.get(Buffer.from('6f57', 'hex'), (err, value) => {
//       //   if (err) console.log("err", err);
//       //   console.log("value", value);
//       // });
//     });
//   });
// });


let db = levelup('./db/');

// db.get('7a5238c9ee7ac46436620ad1fefefbd5181de02f973813cc0add80db59e2589b', (err, value) => {
//   let dec = RLP.decode(Buffer.from(value, 'hex'));
//   console.log('dec[0]', dec[0]);
//   console.log('dec[1]', dec[1].toString());
// });

db.get('772b6711f0f6ecde6a843aee7e97c3fb7445bbae184c95a93e9252e821d9453f', (err, value) => {
  let dec = RLP.decode(Buffer.from(value, 'hex'));
  console.log(dec);
  // let decBranch = RLP.decode(dec[5]);
  // console.log(decBranch[1].toString());
  // console.log(dec[15].toString());
  // console.log("decBranch", decBranch[1].toString());
});
