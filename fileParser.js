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
  this.depth = 0;
  this.input = "";
  this.parent = "base";
}

function fileParserMailbox(fileContainer,depth){  //This class is used to update the fileContainer in a subloop below
  this.container = fileContainer;
  this.depth = depth;
}

/**
 * essentially used to check if the filename actually exists as a file
 */
fileParser.prototype.fileExists = function(that){
  var defer = Q.defer();
  var filename = removeQuotes(this.args[0]);
  // console.log(filename)
  fs.exists(filename, function(exists){
    if(exists){
      var input = fs.createReadStream(filename);
      input.setMaxListeners(0);           //unlimited listeners
      that.fileContainer["root"] = filename;
      that.input = input;
      input.on('error',function(err){     //checking for errors with input
        console.log(err)
        defer.reject(false);
        console.log("fe_error"+filename);
      });
      input.on('readable',function(){     //resolved if the input is readable
        // console.log("fe_"+filename);
        defer.resolve(true);
      }) 
    }
    else {
      // console.log("Invalid file " + filename);
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
  var mailbox = new fileParserMailbox(this.fileContainer,this.depth);
  var localContainer = mailbox.container;
  var beingRead = this.args[0];
  var p = this.parent;
  input.on('data', function(data) {
    remaining += data;
    var index = remaining.indexOf('\n');
    while (index > -1) {
      var line = remaining.substring(0, index);
      remaining = remaining.substring(index + 1);
      var newFile = lineParser(line);
      if(beingRead == "api/locations.js"){
        console.log(newFile);
      }
      if(newFile){
        newFile = directoryCleaner(newFile)
        localContainer[newFile] = {};
      }
      index = remaining.indexOf('\n');
    }
  });
  input.on('end', function() {
    if (remaining.length > 0) {
      var newFile = lineParser(remaining);
      if(newFile){
        newFile = directoryCleaner(newFile)
        localContainer[newFile] = {};
      }
    }
    this.fileContainer = mailbox.container;
    //console.log(p)
    this.depth = mailbox.depth
    func(this);
  });
  input.on('error',function(err){
    console.log(err)
  });
};

/**
 * Function used to actually parse a page
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
      var depth = a.depth;
      childSpawner(container,depth,function(result){
        callback(result)
      });
    });
  });
};

/*
Spawning child fileParsers for each element
*/
function childSpawner(container,depth,callback){
  var staticArray = [container.length]
  var i = 0;
  for( key in container ){
    staticArray[i] = key;
    i++;
  }
  var deeper = depth+1
  var index = 0;
  var key;
  var funcs
  staticArray.forEach(function(k){
    (function(k){
      var parser = new fileParser([k])
      parser.fileContainer = container[k]
      parser.parent = k
      parser.parse(function(result){
        console.log("\n"+parser.parent + " results-----")
        console.log(result)
        console.log("\n"+"-----")
        console.log("\n")
        if(result['root'] == k){
          container[k] = result
        }
        callback(container)
      })
    })(k)
  })
  callback(container) 

}

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
/*
  function to remove the period and slash before files
*/
function directoryCleaner(string){
  if(string.charAt(1) == "."){      
    var pre = string.charAt(0);
    string = pre + string.substring(2,string.length)
    if(string.charAt(1) == "/"){      
      var pre = string.charAt(0);
      string = pre + string.substring(2,string.length)
    }
  }
  return string
}
/*
Function to remove quotations before checking if a file exists
*/
function removeQuotes(string){
  if(string.charAt(0) == "'" || string.charAt(0) == "\""){
    string = string.substring(1,string.length - 1)
  }
  return string
}

module.exports = fileParser;