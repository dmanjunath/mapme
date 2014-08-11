/*
pageCreator is the class that accepts the nodes from fileParser and produces the appropriate D3 graph page
*/
function pageCreator(nodes){
  this.nodes = nodes;
  this.root;
  this.doc = "";
}

pageCreator.prototype.create = function(){    //used to create the page that contains everything we need
  this.root = this.nodes['root'];
  var fs = require('fs');

  this.doc += this.getHeadString();
  this.doc += this.getTreeString();
  this.doc += JSON.stringify(this.nodes);

  var writeStream = fs.createWriteStream('dependencies.html','w');
  writeStream.write(this.doc,'UTF-8',function(error){
  });
}

pageCreator.prototype.getHeadString = function(){         //generate the head of the html element
  var head = '\
  <style>\
  .node {\
  cursor: pointer;\
  }\
  .node circle {\
  fill: #fff;\
  stroke: steelblue;\
  stroke-width: 1.5px;\
  }\
  .node text {\
  font: 10px sans-serif;\
  }\
  .link {\
  fill: none;\
  stroke: #ccc;\
  stroke-width: 1.5px;\
  }\
  </style>\
  <script src="http://d3js.org/d3.v3.min.js"></script>\
  ';
  return head;
}

pageCreator.prototype.getTreeString = function(){     //generate the tree of the html element
  var script = '<script>\
  var margin = {top: 20, right: 120, bottom: 20, left: 120},\
      width = 960 - margin.right - margin.left,\
      height = 800 - margin.top - margin.bottom;\
  var i = 0,\
      duration = 750,\
      root;\
  var tree = d3.layout.tree()\
      .size([height, width]);\
  var diagonal = d3.svg.diagonal()\
    .projection(function(d) { return [d.y, d.x]; });\
  var svg = d3.select("body").append("svg")\
    .attr("width", width + margin.right + margin.left)\
    .attr("height", height + margin.top + margin.bottom)\
  .append("g")\
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");\
  </script>\
  ';
  return script;
}

module.exports = pageCreator;