// let RLP = require("@polkajs/rlp");
let RLP = require("rlp");

// let enc = RLP.encode([null, null, 1, 2, 3, 4, null]);
// console.log("enc", enc);
// let dec = RLP.decode(enc);
// console.log("dec", dec);

// console.log(Buffer.from([0x74,0x75,0x72,0x74,0x6c,0x65]).toString())

let x = [
  null,
  [ Buffer.from([0x20, 0x54]), 'turtle' ],
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  [ Buffer.from([0x00]), '83f4a1f14e9c84159649a0a6dd754c4c00dfa4e3a95a78b9c93f472c310af7a2' ],
  null
];

// let x = Buffer.from([0x00]);

let encode = RLP.encode(x);
console.log("encode", encode);

let decode = RLP.decode(encode);

console.log("decode", decode);


// let x = RLP.decode(Buffer.from("c984206f3254ef636174", 'hex'));
// console.log("x[0]", x[0].toString('hex'));
// console.log("x[1]", x[1].toString());

// console.log(nibblesToBuffer([11, 14]).toString())
//
// function nibblesToBuffer(arr) {
//   let buf = new Buffer(arr.length / 2)
//   for (let i = 0; i < buf.length; i++) {
//     let q = i * 2
//     buf[i] = (arr[q] << 4) + arr[++q]
//   }
//   return buf
// }
