/*

fileParser.js

The fileParser object takes in our command line arguments, and proceeds to find every single instance of "require".
Can only take in 1 input field

*/
function fileParser(args){
  this.args = args;
  this.numargs = args.length;
}
fileParser.prototype.begin = function(){
  console.log(this.args);
}
fileParser.prototype.argCheck = function(){
  if(this.numargs != 1){        //ensuring number of arguments
    console.log("Please use exactly 1 argument");
    return false;
  }
  else{
    return true;
  }
}

module.exports = fileParser;