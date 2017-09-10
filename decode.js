// let RLP = require("@polkajs/rlp");
//
//
// let x = RLP.decode(Buffer.from("c98220be857374617274", 'hex'));
// console.log("x[0]", x[0].toString('hex'));
// console.log("x[1]", x[1].toString());

console.log(nibblesToBuffer([11, 14]).toString())

function nibblesToBuffer(arr) {
  let buf = new Buffer(arr.length / 2)
  for (let i = 0; i < buf.length; i++) {
    let q = i * 2
    buf[i] = (arr[q] << 4) + arr[++q]
  }
  return buf
}
