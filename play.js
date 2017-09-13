const MerklePatricia = require('./lib/MerklePatricia').default;
const levelup = require('levelup');
const RLP = require('@polkajs/rlp');

const MP = new MerklePatricia();

console.log("BEGIN 1");
MP.update(Buffer.from('6f3254', 'hex'), 'cat', (err, hash) => {
  console.log("HASH1", hash);
  console.log("BEGIN 2");
  MP.update(Buffer.from('6f5785', 'hex'), 'dog', (err, hash) => {
    console.log("HASH2", hash);
    console.log("BEGIN 3");
    MP.get(Buffer.from('6f3254', 'hex'), (err, value) => {
      if (err) console.log("err", err);
      console.log("value", value);
    });
    // MP.update(Buffer.from('6154', 'hex'), 'turtle', (err, hash) => {
    //   console.log("HASH3", hash);
    // });
  });
});


// let db = levelup('./db/');
//
// db.get('6ee1e64ac3d93bdbf48c0a2cc02a91df9e83a3dc11c03568b3631a8fcd2ca9d2', (err, value) => {
//   let dec = RLP.decode(Buffer.from(value, 'hex'));
//   console.log('dec[0]', dec[0]);
//   console.log('dec[1]', dec[1].toString());
// });

// db.get('83f4a1f14e9c84159649a0a6dd754c4c00dfa4e3a95a78b9c93f472c310af7a2', (err, value) => {
//   let dec = RLP.decode(Buffer.from(value, 'hex'));
//   console.log(dec);
//   // let decBranch = RLP.decode(dec[5]);
//   // console.log(decBranch[1].toString());
//   // console.log(dec[5].toString());
// });
