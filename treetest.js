// var fileParser = require('./lib/fileParser.js');
// var fp = new fileParser('./lib/stream.js');
// fp.parse();

var TreeNode = require("tree-node");
var rootNode = new TreeNode("filename");
var childNode = rootNode.createChild("filenam1")//.data({"filename": "asdf"});
var childNode2 = childNode.createChild("two")//.data({"filename": "asdfasdfasd"});
var fileIO = require('./lib/file_helpers.js');


fileIO.writeToFile('./data.json', rootNode, function(err, done){
  if(err) throw err;
});



fileIO.readFromFile('./data.json', function(err, data){
  var rootNode = data;
  console.log(rootNode);
});