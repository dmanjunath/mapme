var fs = require('fs');
// var stream = require('./stream.js');
var stream = require('stream');
var fileIO = require('./file_helpers.js');
var path = require('path');
var Q = require('q');

var requireRegexAll = /require\(['"]([^'"]*)['"]\)/i;
var requireRegexJS = /require\(['"]([^'"]*.js)['"]\)/i;
allFiles = [];

function fileParser(filename,rootnode,parentnode,path){
  this.rootNode = rootnode;
  this.path = path;
  this.parentNode = parentnode;
  this.filename = filename;
  this.listOfRequires = [];
  this.listOfFilesToParse = [];
}

/**
 * essentially used to check if the filename actually exists as a file
 */
fileParser.prototype.checkIfFileExists = function(callback){
  var filename = this.filename;
  fs.exists(filename, function(exists){
    if(exists){
      callback(null,true);
    }
    else {
      callback(null,false);
    }
  });
};

fileParser.prototype.parse = function(callback){
  var that = this;
  this.computeFilenameAndPath();
  this.checkIfFileExists(function(err,data){
    if(data === true){
      var source = fs.createReadStream(that.filename);

      var transformStream = new stream.Transform({objectMode: true});
       
      transformStream._transform = function (chunk, encoding, done) {
        var data = chunk.toString();
        if (this._lastLineData) data = this._lastLineData + data;
        var lines = data.split('\n');
        this._lastLineData = lines.splice(lines.length-1,1)[0];
        lines.forEach(this.push.bind(this));
        done();
      };
       
      transformStream._flush = function (done) {
        if (this._lastLineData) this.push(this._lastLineData);
        this._lastLineData = null;
        done();
      };

      source.pipe(transformStream);
      transformStream.on('readable', function(){
        var line = transformStream.read();
        if(requireRegexAll.exec(line) !== null){
          var normalPath1 = path.normalize(requireRegexAll.exec(line)[1]);
          that.listOfRequires.push(normalPath1);
          var reg = requireRegexJS.exec(line);
          if(reg !== null){
            var normalPath2 = path.normalize(reg[1]);
            that.listOfFilesToParse.push(normalPath2);
            allFiles.push(normalPath2);
          }
        }
      });
      transformStream.on('end', function(){
        source.close();
        if(that.listOfFilesToParse.length > 0){
          createChildren(that.parentNode,that.rootNode,that.listOfRequires,that.listOfFilesToParse,that.path,callback);
        }
        else {
          callback(null);
        }
        console.log("all files", allFiles);
      });
      transformStream.on('error',function(err){
        console.log(err);
      });
    }
    else{

    }
  });
};

/*
Gets the relative path
*/
fileParser.prototype.computeFilenameAndPath = function(){
  this.filename = path.resolve(this.path+"/",this.filename);
  var file = path.basename(this.filename);
  var c = this.filename.replace(file,"");
  this.path = c;
};

/*
Creating the children
*/
function createChildren(parentNode,rootNode,filesList,parseList,path,callback){
  for(var i = 0; i < filesList.length; i++){
    var child = parentNode.createChild(filesList[i]);
    writeJSON(rootNode);
    if(parseList.indexOf(filesList[i]) !== -1){
      newParser(filesList[i],child,rootNode,path, callback);
      if(allFiles.indexOf(filesList[i] !== -1)) allFiles.splice(allFiles.indexOf(filesList[i]), 1);
    }
    else {
      callback(null,rootNode);
    }
  }
}
/*
Create a single child
*/
function newParser(filename,parentNode,rootNode,path, callback){
  // console.log(filename);
  var fp = new fileParser(filename,rootNode,parentNode,path);
  fp.parse(function(err,data){
    // console.log("newparse");
    // console.log(filename + " " + data);
    callback(null, rootNode);
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