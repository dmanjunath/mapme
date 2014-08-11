/*

fileParser.js

The fileParser object takes in our command line arguments, and proceeds to find every single instance of "require".
Can only take in 1 input field

*/
function fileParser(args){
  this.args = args;
  this.numargs = args.length;
  this.files = {};
  this.lineParser = function(data){           //Checks if the line contains our desired words (just require for now)
    console.log('Line: ' + data);
  }; 
  this.readLines = function (input,func){     //Reads every line of a file from an fsStream
    var remaining = '';
    if(!func){
      console.log("undefined func");
      return;
    }
    input.on('data', function(data) {
      remaining += data;
      var index = remaining.indexOf('\n');
      while (index > -1) {
        var line = remaining.substring(0, index);
        remaining = remaining.substring(index + 1);
        func(line);
        index = remaining.indexOf('\n');
      }
    });

    input.on('end', function() {
      if (remaining.length > 0) {
        func(remaining);
      }
    });
  };
}
fileParser.prototype.begin = function(){    
  fs = require('fs');
  var filename = this.args[0];
  if (fs.existsSync(filename)) {
    var input = fs.createReadStream(filename);
    this.readLines(input,this.lineParser);
  }
  else{
    console.log("Please enter a valid file");
  }
}
fileParser.prototype.argCheck = function(){       //ensuring number of arguments is correct
  if(this.numargs != 1){        
    console.log("Please use exactly 1 argument");
    return false;
  }
  else{
    return true;
  }
}
module.exports = fileParser;
