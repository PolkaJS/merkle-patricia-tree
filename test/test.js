const redtape = require('redtape');
const rimraf  = require('rimraf');
const levelup = require('levelup');

const test = redtape(beforeEach, afterEach);
const MerklePatricia = require('../lib/MerklePatricia').default;

function beforeEach(cb) {
  rimraf.sync('./db'); // remove the database we will be playing with
  levelup('./db/', cb);
}

function afterEach(db, cb) {
  db.close(cb);
}

test('Simple case. Update a value and fetch', function (t, db) {
    t.plan(3);

    const MP = new MerklePatricia({ db: db });

    MP.update(Buffer.from('6f3254', 'hex'), 'cat', (err, hash) => {
      t.error(err);
      MP.get(Buffer.from('6f3254', 'hex'), (err, value) => {
        t.error(err);
        t.equal(value, 'cat', "we can retrieve the same value we placed in the tree");
        t.end();
      });
    });
});

test('Create a branch, check both values are obtainable', function (t, db) {
    t.plan(6);

    const MP = new MerklePatricia({ db: db });

    MP.update(Buffer.from('6f3254', 'hex'), 'cat', (err, hash) => {
      t.error(err);
      MP.update(Buffer.from('6f5785', 'hex'), 'dog', (err, hash) => {
        t.error(err);
        MP.get(Buffer.from('6f3254', 'hex'), (err, value) => {
          t.error(err);
          t.equal(value, 'cat', 'get cat');
          MP.get(Buffer.from('6f5785', 'hex'), (err, value) => {
            t.error(err);
            t.equal(value, 'dog', 'get dog');
            t.end();
          });
        });
      });
    });
});

test('Create a branch, then add value to 16th value of branch', function (t, db) {
    t.plan(10);

    const MP = new MerklePatricia({ db: db });

    MP.update(Buffer.from('6f3254', 'hex'), 'cat', (err, hash) => {
      t.error(err);
      MP.update(Buffer.from('6f5785', 'hex'), 'dog', (err, hash) => {
        t.error(err);
        MP.update(Buffer.from('6f', 'hex'), 'turtle', (err, hash) => {
          t.error(err);
          MP.get(Buffer.from('6f3254', 'hex'), (err, value) => {
            t.error(err);
            MP.get(Buffer.from('6f3254', 'hex'), (err, value) => {
              t.error(err);
              t.equal(value, 'cat', 'get cat');
              MP.get(Buffer.from('6f5785', 'hex'), (err, value) => {
                t.error(err);
                t.equal(value, 'dog', 'get dog');
                MP.get(Buffer.from('6f', 'hex'), (err, value) => {
                  t.error(err);
                  t.equal(value, 'turtle', 'get turtle');
                  t.end();
                });
              });
            });
          });
        });
      });
    });
});

test('Create a branch, then add another to an empty slot', function (t, db) {
    t.plan(10);

    const MP = new MerklePatricia({ db: db });

    MP.update(Buffer.from('6f3254', 'hex'), 'cat', (err, hash) => {
      t.error(err);
      MP.update(Buffer.from('6f5785', 'hex'), 'dog', (err, hash) => {
        t.error(err);
        MP.update(Buffer.from('6f77', 'hex'), 'turtle', (err, hash) => {
          t.error(err);
          MP.get(Buffer.from('6f3254', 'hex'), (err, value) => {
            t.error(err);
            MP.get(Buffer.from('6f3254', 'hex'), (err, value) => {
              t.error(err);
              t.equal(value, 'cat', 'get cat');
              MP.get(Buffer.from('6f5785', 'hex'), (err, value) => {
                t.error(err);
                t.equal(value, 'dog', 'get dog');
                MP.get(Buffer.from('6f77', 'hex'), (err, value) => {
                  t.error(err);
                  t.equal(value, 'turtle', 'get turtle');
                  t.end();
                });
              });
            });
          });
        });
      });
    });
});

test('Create a branch, then force a split at dog to create a second branch', function (t, db) {
    t.plan(10);

    const MP = new MerklePatricia({ db: db });

    MP.update(Buffer.from('6f3254', 'hex'), 'cat', (err, hash) => {
      t.error(err);
      MP.update(Buffer.from('6f5785', 'hex'), 'dog', (err, hash) => {
        t.error(err);
        MP.update(Buffer.from('6f5799', 'hex'), 'turtle', (err, hash) => {
          t.error(err);
          MP.get(Buffer.from('6f3254', 'hex'), (err, value) => {
            t.error(err);
            MP.get(Buffer.from('6f3254', 'hex'), (err, value) => {
              t.error(err);
              t.equal(value, 'cat', 'get cat');
              MP.get(Buffer.from('6f5785', 'hex'), (err, value) => {
                t.error(err);
                t.equal(value, 'dog', 'get dog');
                MP.get(Buffer.from('6f5799', 'hex'), (err, value) => {
                  t.error(err);
                  t.equal(value, 'turtle', 'get turtle');
                  t.end();
                });
              });
            });
          });
        });
      });
    });
});

test('Create a branch, then force a split, but the new value is at pos 16', function (t, db) {
    t.plan(10);

    const MP = new MerklePatricia({ db: db });

    MP.update(Buffer.from('6f3254', 'hex'), 'cat', (err, hash) => {
      t.error(err);
      MP.update(Buffer.from('6f5785', 'hex'), 'dog', (err, hash) => {
        t.error(err);
        MP.update(Buffer.from('6f57', 'hex'), 'turtle', (err, hash) => {
          t.error(err);
          MP.get(Buffer.from('6f3254', 'hex'), (err, value) => {
            t.error(err);
            MP.get(Buffer.from('6f3254', 'hex'), (err, value) => {
              t.error(err);
              t.equal(value, 'cat', 'get cat');
              MP.get(Buffer.from('6f5785', 'hex'), (err, value) => {
                t.error(err);
                t.equal(value, 'dog', 'get dog');
                MP.get(Buffer.from('6f57', 'hex'), (err, value) => {
                  t.error(err);
                  t.equal(value, 'turtle', 'get turtle');
                  t.end();
                });
              });
            });
          });
        });
      });
    });
});
