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

/**
 * essentially used to check if the filename actually exists as a file
 */
fileParser.prototype.fileExists = function(){
  var defer = Q.defer();
  var filename = removeQuotes(this.args[0]);
  var parser = this
  fs.exists(filename, function(exists){
    if(exists){
      var input = fs.createReadStream(filename);
      input.setMaxListeners(0);           //unlimited listeners
      parser.fileContainer["root"] = filename;
      parser.input = input;
      input.on('error',function(err){     //checking for errors with input
        console.log(err)
        defer.reject(false);
        input.close()
        // console.log("fe_error"+filename);
      });
      input.on('readable',function(){     //resolved if the input is readable
        // console.log("fe_"+filename);
        input.close()
        defer.resolve(true);
      }) 
    }
    else {
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
  var beingRead = this.args[0];

  var parser = this;
  var localContainer = this.fileContainer;
  var input = fs.createReadStream(beingRead);
  input.on('data', function(data) {
    remaining += data;
    var index = remaining.indexOf('\n');
    while (index > -1) {
      var line = remaining.substring(0, index);
      remaining = remaining.substring(index + 1);
      var newFile = lineParser(line);
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
    func(parser);
  });
  input.on('error',function(err){
    // console.log(err)
  });
};

/**
 * Function used to actually parse a page
 */
fileParser.prototype.parse = function(callback){
  var results = {};
  var b = this.parent
  var parser = this
  that = this;
  if(this.argCheck()){
    if(this.fileExists()){
      this.readLines(function(parser){
        var container = parser.fileContainer
        callback(container)
        childSpawner(container,callback);
      })
    }
  }
};

/*
Spawning child fileParsers for each element
*/
function childSpawner(container,callback){
  var staticArray = [container.length]
  var i = 0;
  for( key in container ){
    staticArray[i] = key;
    i++;
  }
  var index = 0;
  var key;
  var funcs
  staticArray.forEach(function(k){
    (function(k,callback){
      var parser = new fileParser([k])
      parser.fileContainer = container[k]
      parser.parent = k
      parser.parse(function(result){
        // console.log("\n"+parser.parent + " results for " + k + "-----")
        // console.log(result)
        // console.log(result['root'])
        // console.log("\n"+"-----")
        // console.log("\n")
        if(result['root'] == k){
          container[k] = result
          // console.log(container)
          callback(container)
        }
      })
      callback(container)
    })(k,callback)
  })
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
  return removeQuotes(string)
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

function length( object ) {
    return Object.keys(object).length;
}

module.exports = fileParser;