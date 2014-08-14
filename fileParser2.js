var fs = require('fs');
var Q = require('q');
var stream = require('./stream.js');
var requireRegex = /require\(['"]([^'"]*)['"]\)/i;

function fileParser(filename){
  this.filename = filename;
  this.listOfRequires = [];
}

fileParser.prototype.parse = function(){
  var source = fs.createReadStream(this.filename);
  source.pipe(stream);
  stream.on('readable', function(){
    var line = stream.read();
    var reg = requireRegex.exec(line);
    if(reg !== null){
      console.log(reg[1]);
    }
  });
  stream.on('end', function(){
    console.log('done');
  });
};

module.exports = fileParser;