var fs = require('fs');
var Q = require('q');

/*

fileParser.js

The fileParser object takes in our command line arguments, and proceeds to find every single instance of "require".
Can only take in 1 input field

*/
function fileParser(args){
  this.args = args;
  this.numargs = args.length;
  this.fileContainer = {};
  // this.fileCounter = 0;
  this.input = "";
}

function fileParserMailbox(fileContainer){  //This class is used to update the fileContainer in a subloop below
  this.container = fileContainer;
  // this.counter = fileCounter;
}

/**
 * essentially used to check if the filename actually exists as a file
 */
fileParser.prototype.fileExists = function(that){
  var defer = Q.defer();
  var filename = this.args[0];
  fs.exists(filename, function(exists){
    if(exists){
      var input = fs.createReadStream(filename);
      that.fileContainer["root"] = filename;
      that.input = input;
      defer.resolve(true);
    }
    else {
      console.log("Please enter a valid file");
      defer.reject(false);
    }
  });
  return defer.promise;
};

/**
 * ensuring number of arguments is correct
 */
fileParser.prototype.argCheck = function(){
  var defer = Q.defer();
  if(this.numargs != 1){
    console.log("Please use exactly 1 argument");
    defer.reject(false);
  }
  else{
    defer.resolve(true);
  }
  return defer.promise;
};

/**
 * Reads every line of a file from an fsStream
 */
fileParser.prototype.readLines = function(func){
  var remaining = '';
  var input = this.input;
  var mailbox = new fileParserMailbox(this.fileContainer);
  var localContainer = mailbox.container;
  input.on('data', function(data) {
    remaining += data;
    var index = remaining.indexOf('\n');
    while (index > -1) {
      var line = remaining.substring(0, index);
      remaining = remaining.substring(index + 1);
      var newFile = lineParser((line));
      if(newFile)
        localContainer[newFile] = {};
      index = remaining.indexOf('\n');
    }
  });
  input.on('end', function() {
    if (remaining.length > 0) {
      var newFile = lineParser(remaining);
      if(newFile)
        localContainer[newFile] = {};
    }
    this.fileContainer = mailbox.container;
    func(this);
  });
};

/**
 * function used to actually parse a page
 */
fileParser.prototype.parse = function(callback){
  var results = {};
  that = this;
  this.argCheck()
  .then(function(){
    return that.fileExists(that);
  })
  .then(function(){
    that.readLines(function(a){
      var container = a.fileContainer;
      for(var key in container){
        // console.log(key + " " + container[key]);
      }
      results = container;
      callback(results);
    });
  });
};

/**
 * Checks if the line contains our desired words (just require for now)
 */
lineParser = function(data){
  if(contains(data,"require")){
    var rawfile = data.split("require")[1];
    var file = lineStripper(rawfile);
    return file;
  }
  else{
    return null;
  }
};

/**
 * simple function to check for substrings
 */
function contains(a,b){
  return a.indexOf(b) != -1;
}

/**
 * function to strip lines to solo filenames
 */
function lineStripper(string){
  var regex = /\(([^)]+)\)/;
  string = string.replace(";","");
  string = string.replace(",","");
  string = string.replace("\n","");
  string = regex.exec(string);
  string = string[1];
  return string;
}

module.exports = fileParser;