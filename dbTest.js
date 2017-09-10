const levelup = require('levelup');

let db = levelup('./db/');

db.put('key', 'value');

db.get('key', (err, value) => {
  console.log("err", err);
  console.log("value", value);
})
