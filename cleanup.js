const fs = require('fs');

if (fs.existsSync('./db')) {
  fs.readdirSync('./db').forEach(function(file, index){
    var curPath = './db' + "/" + file;
    if (fs.lstatSync(curPath).isDirectory()) { // recurse
      deleteFolderRecursive(curPath);
    } else { // delete file
      fs.unlinkSync(curPath);
    }
  });
  fs.rmdirSync('./db');
  console.log(`CLEANED UP THE TEST DATABASE! (free of charge)`)
}
