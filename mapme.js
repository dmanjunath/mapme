#!/usr/bin/env node
/*
  mapme is a node tool designed to graphically display the dependencies of a file in your web application.
  
  requirements:
  minimist (https://www.npmjs.org/package/minimist)
  
  by: Hareesh Nagaraj & Dheeraj Manjunath
*/
var parseArgs = require('minimist');      //Using the minimist node package 
var fs = require('fs');                   //Requiring the basic file system
var fileParser = require('./fileParser.js');

var argArray = parseArgs(process.argv.slice(2));  //Grabbing the command line arguments
var argv = argArray['_'];

var parser = new fileParser(argv);  
parser.parse();
// if(parser.argCheck()){                    //Checking the number of arguments, reading lines based on callback
//   parser.begin(function(){
//     parser.readLines(function(){
//         for(var key in parser.fileContainer){
//           console.log(key + " " + parser.fileContainer[key]);
//         }
//     });
//   });
// }