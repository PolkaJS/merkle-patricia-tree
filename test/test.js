const test           = require('tape');
const MerklePatricia = require('../lib/MerklePatricia').default;

test('Simple case. Update a value and fetch', function (t) {
    t.plan(1);

    const MP = new MerklePatricia();

    MP.update(Buffer.from('6f3254', 'hex'), 'cat', (err, hash) => {
      MP.get(Buffer.from('6f3254', 'hex'), (err, value) => {
        if (err) console.log("err", err);
        t.equal(value, 'cat', "we can retrieve the same value we placed in the tree");
      });
    });
});

// test('Create a branch, check both values are obtainable', function (t) {
//     t.plan(2);
//
//     const MP = new MerklePatricia();
//
//     MP.update(Buffer.from('6f3254', 'hex'), 'cat', (err, hash) => {
//       MP.update(Buffer.from('6f5785', 'hex'), 'dog', (err, hash) => {
//         MP.get(Buffer.from('6f3254', 'hex'), (err, value) => {
//           if (err) console.log("err", err);
//           t.equal(value, 'cat', 'get cat');
//         });
//         MP.get(Buffer.from('6f3254', 'hex'), (err, value) => {
//           if (err) console.log("err", err);
//           t.equal(value, 'dog', 'get dog');
//         });
//       });
//     });
// });
