// var fileParser = require('./lib/fileParser.js');
// var fp = new fileParser('./lib/stream.js');
// fp.parse();

var TreeNode = require("tree-node");
var rootNode = new TreeNode("filename");
var childNode = rootNode.createChild("filenam1")//.data({"filename": "asdf"});
var childNode2 = childNode.createChild("two")//.data({"filename": "asdfasdfasd"});
var fs = require('fs');

function getData(srcPath, cb) {
  fs.readFile(srcPath, 'utf8', function (err, data) {
    if (err) cb(err);
    cb(null, data);
  });
}

function writeData(savPath, data, cb){
  fs.writeFile (savPath, data, function(err) {
    if (err) cb(err);
    else cb(null);
  });
}


// writeData('./data.json', JSON.stringify(rootNode), function(err, done){
//   if(err) throw err;
// });



// getData('./data.json', function(err, data){
//   var rootNode = JSON.parse(data);
//   console.log(rootNode);
  
// });