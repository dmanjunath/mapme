var fs = require('fs');
var Q = require('q');
var requireRegex = /require\(['"]([^'"]*)['"]\)/i;
var streamRegex = /.\/([a-zA-Z\/]*.js)/;
/*

fileParser.js

The fileParser object takes in our command line arguments, and proceeds to find every single instance of "require".
Can only take in 1 input field

*/
function fileParser(args){
  this.args = args;
  this.numargs = args.length;
  this.fileContainer = {};
  this.input = "";
  this.parent = "base";
}

/**
 * essentially used to check if the filename actually exists as a file
 */
fileParser.prototype.fileExists = function(){
  var defer = Q.defer();
  var filename = this.args[0];
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
  var parser = this;
  var localContainer = this.fileContainer;
  var streamlocation = directoryCleaner(this.args[0])
  var input = fs.createReadStream(streamlocation);
  input.on('data', function(data) {
    remaining += data;
    var index = remaining.indexOf('\n');
    while (index > -1) {
      var line = remaining.substring(0, index);
      remaining = remaining.substring(index + 1);
      var newFile = lineParser(line);
      if(newFile){
        newFile = newFile
        localContainer[newFile] = {};
      }
      index = remaining.indexOf('\n');
    }
  });
  input.on('end', function() {
    if (remaining.length > 0) {
      var newFile = lineParser(remaining);
      if(newFile){
        newFile = newFile
        localContainer[newFile] = {};
      }
    }
    func(parser);
  });
  input.on('error',function(err){

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
  if(this.argCheck()){                    //checking arguments
    if(this.fileExists()){                //checking if file exists
      this.readLines(function(parser){    //reading lines, returns parser object
        var container = parser.fileContainer
        childSpawner(container,callback); //spawning children to read
      })
    }
  }
};

/*
Spawning child fileParsers for each element
*/
function childSpawner(container,callback){
  for( key in container ){
    (function(k,callback){
      var parser = new fileParser([k])
      parser.fileContainer = container[k]
      parser.parse(function(result){
        container[k] = result
        callback(container)
      })
    })(key,callback)
  }
  callback(container)         //default callback
}

/**
 * Checks if the line contains our desired words (just require for now)
 */
lineParser = function(data){
  var a = requireRegex.exec(data)
  if(a){
    return a[1]
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
  var a = streamRegex.exec(string)
  if(a){
    string = a[1]
  }
  return string
  // if(string.charAt(1) == "."){      
  //   var pre = string.charAt(0);
  //   string = pre + string.substring(2,string.length)
  //   if(string.charAt(1) == "/"){      
  //     var pre = string.charAt(0);
  //     string = pre + string.substring(2,string.length)
  //     // console.log(string)
  //   }
  // }

}

module.exports = fileParser;