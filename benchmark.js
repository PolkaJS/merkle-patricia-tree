const MerklePatricia = require('./lib/MerklePatricia').default;
const randomWord     = require('random-word');
const randomHex      = require('random-hex-string');

const MP = new MerklePatricia();
const n = 7000;

function testLoop(i) {
  // create random key and value
  MP.update(Buffer.from(randomHex.sync(32), 'hex'), randomWord(), () => {
    if (i < n)
      testLoop(++i);
    else
      console.timeEnd("dbsave");
  });
}

console.time("dbsave");
testLoop(0);


// n = 400  => 930.531ms
// n = 1000 => 1935.855ms
