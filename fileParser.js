/*

fileParser.js

The fileParser object takes in our command line arguments, and proceeds to find every single instance of "require".
Can only take in 1 input field

*/

function fileParser(args){
  this.args = args;
  this.numargs = args.length;
  this.fileContainer = {};
  this.fileCounter = 0;
  this.input = "";
}

function fileParserMailbox(fileContainer,fileCounter){
  this.container = fileContainer;
  this.counter = fileCounter;
}

fileParser.prototype.begin = function(){    
  fs = require('fs');
  var filename = this.args[0];
  if (fs.existsSync(filename)) {
    var input = fs.createReadStream(filename);
    this.input = input;
    return true;
  }
  else{
    console.log("Please enter a valid file");
    return false;
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

fileParser.prototype.readLines = function(func){  //Reads every line of a file from an fsStream
  var remaining = '';
  var input = this.input;
  var mailbox = new fileParserMailbox(this.fileContainer,this.fileCounter);
  var localContainer = mailbox.container;
  var localCounter = mailbox.counter;
  input.on('data', function(data) {
    remaining += data;
    var index = remaining.indexOf('\n');
    while (index > -1) {
      var line = remaining.substring(0, index);
      remaining = remaining.substring(index + 1);
      var newFile = lineParser((line));
      if(newFile)
        localContainer[localCounter] = newFile;
        localCounter++;
      index = remaining.indexOf('\n');
    }
  });
  input.on('end', function() {
    if (remaining.length > 0) {
      var newFile = lineParser(remaining);
      if(newFile)
        localContainer[localCounter] = newFile;
        localCounter++;
    }
    this.fileContainer = mailbox.container;
    func(this);
  });
}

fileParser.prototype.parse = function(){        //function used to actually parse a script
  var begun = false;
  if(this.argCheck()){      //continue
    if(this.begin()){
      this.readLines(function(a){
          var container = a.fileContainer;
          console.log(container);
          for(var key in container){
          console.log(key + " " + container[key]);
        }
      });
    }
  }
}

lineParser = function(data){   //Checks if the line contains our desired words (just require for now)
  if(contains(data,"require")){
    var rawfile = data.split("require")[1];
    var file = lineStripper(rawfile);
    return file;
  }
  else{
    return null;
  }
}

function contains(a,b){            //simple function to check for substrings
  return a.indexOf(b) != -1; 
}
function lineStripper(string){     //function to strip lines to solo filenames
  var regex = /\(([^)]+)\)/;
  string = string.replace(";","");
  string = string.replace(",","");
  string = string.replace("\n","");
  string = regex.exec(string);
  string = string[1];
  return string;
}

module.exports = fileParser;