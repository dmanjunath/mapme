#!/usr/bin/env node
/*
  mapme is a node tool designed to graphically display the dependencies of a file in your web application.
  
  requirements:
  minimist (https://www.npmjs.org/package/minimist)
  
  by: Hareesh Nagaraj & Dheeraj Manjunath
*/
var parseArgs = require('minimist')          //Using the minimist node package 
var fs = require('fs')                       //Requiring the basic file system
var fileParser = require('./fileParser.js')  //fileParser is the class used to parse the page for dependencies
var argArray = parseArgs(process.argv.slice(2))  //Grabbing the command line arguments
var argv = argArray['_']

var map = {}
var parser = new fileParser(argv)
parser.fileContainer = map

var a = 0
var result = parser.parse(function(result){
   console.log("Generating..."+a)
   // console.log(result)
   a++
   createPage(result);
})

function createPage(result){
  var pageCreator = require('./pageCreator.js')  //pageCreator is the class that generates the D3 page
  var page = new pageCreator(result)
  pageCreator.parent = result.root
  page.create()
}