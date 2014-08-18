var parseArgs = require('minimist');              //Using the minimist node package 
var fileParser = require('./lib/fileParser.js');
var TreeNode = require("tree-node");

var argArray = parseArgs(process.argv.slice(2));  //Grabbing the command line arguments
var argv = argArray._;
var writeFile = 'dependencies.html';              //the default file being written to
var dataObj = {};

if(argv.length < 1 || argv.length > 2){
  console.log("Incorrect arguments");
}
else {
  var readFile = argv[0];
  if(argv[1]){
    writeFile = argv[1];
  }
  var rootNode = new TreeNode(readFile);
  var fp = new fileParser(readFile,rootNode,rootNode,__dirname);
  fp.parse(function(err,data){
    // call pagecreator and pass in the rootnode here
    // data is the root node
    createJSON(data, data, dataObj, function(){
      console.log(JSON.stringify(dataObj));
    });
  });
}

// this should go in the pageCreator file
function createJSON(rootNode, currentNode, currentState, callback){
  var state;
  if(currentNode === rootNode){
    dataObj.name = rootNode._id;
    dataObj.children = [];
    state = dataObj.children;
    currentState = dataObj.children;
  }

  currentNode._childIdsList.forEach(function(id){
    var node = rootNode.getNode(id);
    if(node._childs.length !== 0){
      currentState.push({name: node._id, children: []});
      state = currentState[currentState.length - 1].children;
    }
    createJSON(rootNode, node, state, function(){

    });
  });
  callback(null);
}