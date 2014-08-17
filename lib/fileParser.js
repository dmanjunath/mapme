var fs = require('fs');
var stream = require('./stream.js');
var path = require('path');
var requireRegexAll = /require\(['"]([^'"]*)['"]\)/i;
var requireRegexJS = /require\(['"]([^'"]*.js)['"]\)/i;

function fileParser(filename){
  this.filename = filename;
  this.listOfRequires = [];
  this.listOfFilesToParse = [];
}

fileParser.prototype.parse = function(){
  var source = fs.createReadStream(this.filename);
  var that = this;
  source.pipe(stream);
  stream.on('readable', function(){
    var line = stream.read();
    if(requireRegexAll.exec(line) !== null){
      that.listOfRequires.push(requireRegexAll.exec(line)[1]);
      var reg = requireRegexJS.exec(line);
      if(reg !== null){
        var normalPath = path.normalize(reg[1]);
        that.listOfFilesToParse.push(normalPath);
      }
    }
  });
  stream.on('end', function(){
    // console.log('done');
    console.log(that.listOfRequires);
    console.log(that.listOfFilesToParse);
  });
  stream.on('error',function(){

  });
};

module.exports = fileParser;