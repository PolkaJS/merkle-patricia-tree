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
    MP.update(Buffer.from('6f', 'hex'), 'turtle', (err, hash) => {
      console.log("HASH3", hash);
      MP.get(Buffer.from('6f3254', 'hex'), (err, value) => {
        if (err) console.log("err", err);
        console.log("value", value);
      });
    });
  });
});


// let db = levelup('./db/');

// db.get('79b408209fc74088f9c2139ac8d5b78d30e7e29272b8502301477ec43139a826', (err, value) => {
//   let dec = RLP.decode(Buffer.from(value, 'hex'));
//   console.log('dec[0]', dec[0]);
//   console.log('dec[1]', dec[1].toString());
// });

// db.get('70a2671c1eb01769053bf7e186a1e10bb161d69da5f690fac29842d6f96dddc2', (err, value) => {
//   let dec = RLP.decode(Buffer.from(value, 'hex'));
//   console.log(dec);
//   // let decBranch = RLP.decode(dec[15]);
//   // console.log(decBranch[1].toString());
//   console.log(dec[15].toString());
// });
