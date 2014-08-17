var fs = require('fs');
var stream = require('./stream.js');
var fileIO = require('./file_helpers.js');
var path = require('path');
var Q = require('q');

var requireRegexAll = /require\(['"]([^'"]*)['"]\)/i;
var requireRegexJS = /require\(['"]([^'"]*.js)['"]\)/i;

function fileParser(filename,rootnode,parentnode){
  this.rootNode = rootnode;
  this.parentNode = parentnode;
  this.filename = filename;
  this.listOfRequires = [];
  this.listOfFilesToParse = [];
}

/**
 * essentially used to check if the filename actually exists as a file
 */
fileParser.prototype.fileExists = function(){
  var defer = Q.defer();
  var filename = this.filename;
  fs.exists(filename, function(exists){
    if(exists){
      defer.resolve(true);
    }
    else {
      defer.reject(false);
    }
  });
  return defer.promise;
};

fileParser.prototype.parse = function(callback){
  var that = this;
  this.fileExists().then(function(){
    var source = fs.createReadStream(that.filename);
    source.setMaxListeners(0);  
    source.pipe(stream);
    stream.on('readable', function(){
      var line = stream.read();
      if(requireRegexAll.exec(line) !== null){
        var normalPath1 = path.normalize(requireRegexAll.exec(line)[1]);
        that.listOfRequires.push(normalPath1);
        var reg = requireRegexJS.exec(line);
        if(reg !== null){
          var normalPath2 = path.normalize(reg[1]);
          that.listOfFilesToParse.push(normalPath2);
        }
      }
    });
    stream.on('end', function(){
      console.log('done');
      // console.log(that.listOfRequires);
      // console.log(that.listOfFilesToParse);
      createChildren(that.parentNode,that.rootNode,that.listOfRequires,that.listOfFilesToParse,callback);
    });
    stream.on('error',function(){
      // console.log(err);
    });
  },function(){
    callback(null,"no file");
  });
};

/*
Creating the children
*/
function createChildren(parentNode,rootNode,filesList,parseList,callback){
  for(var i = 0; i < filesList.length; i++){
    var child = parentNode.createChild(filesList[i]);
    writeJSON(rootNode);
    if(parseList.indexOf(filesList[i]) !== -1){
      newParser(filesList[i],child,rootNode);
    }
  }
  callback(null,"finished");
}
/*
Create a single child
*/
function newParser(filename,parentNode){
  var fp = new fileParser(filename,parentNode);
  fp.parse(function(err,data){
    console.log(data);
  });
}

/*
Write to a json file
*/
function writeJSON(root){
  fileIO.writeToFile('./data.json', root, function(err, done){
    if(err) throw err;
  });
}


module.exports = fileParser;