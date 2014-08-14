/*
pageCreator is the class that accepts the nodes from fileParser and produces the appropriate D3 graph page
*/
function pageCreator(nodes){
  this.nodes = nodes;
  this.root =this.nodes['root'];
  this.doc = "";
  this.parent;
}

pageCreator.prototype.create = function(){    //used to create the page that contains everything we need
  var fs = require('fs');

  this.doc += this.getHeadString();
  this.doc += this.getTreeString();
  // this.writeJSON();
  var writeStream = fs.createWriteStream('dependencies.html','w');
  writeStream.write(this.doc,'UTF-8',function(error){   });
  writeStream.end();
}


pageCreator.prototype.getTreeJson = function(){           //appropriately formatting the json
  var raw = this.nodes;
  var finalJSON = {};
  finalJSON.name = this.root;
  var children = [];
  var a = false
  if(this.root == "./api/locations.js"){
    a = true   
  }
  for(var key in raw){
    if(key != 'root'){
      var child = {};
      child["name"] = key;
      if(countProperties(raw[key]) > 0){
        var grandkids = new pageCreator(raw[key])
        grandkids.parent = this.parent
        var grandJSON = grandkids.getTreeJson();
        grandJSON["name"] = key
        child["children"] = []
        child["children"].push(grandJSON)
        children.push(grandJSON);
      }
      else{
        children.push(child);
      }
    }
  }
  finalJSON["children"] = children;
  finalJSON["parent"] = this.parent
  return finalJSON;
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
  var json = JSON.stringify(this.getTreeJson(),null,2);

  var script = '\
  <body>\
  <script>\
\n  var margin = {top: 20, right: 120, bottom: 20, left: 120},\
      width = 1200 - margin.right - margin.left,\
      height = 800 - margin.top - margin.bottom;\
\n  var i = 0,\
      duration = 750,\
      root;\
\n  var tree = d3.layout.tree()\
      .size([height, width]);\
\n  var diagonal = d3.svg.diagonal().projection(function(d) { return [d.y, d.x]; });\
\n  var svg = d3.select("body").append("svg");\
\nvar svg = d3.select("body").append("svg")\
\n    .attr("width", width + margin.right + margin.left)\
\n    .attr("height", height + margin.top + margin.bottom)\
\n  .append("g")\
\n    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");\
\n  root = '+json+';\
\n  root.x0 = height / 2;\
\n  root.y0 = 0; \
\n  update(root);\
\n  function collapse(d) {\
\n      if (d.children) {\
\n        console.log(d)\
\n        d._children = d.children;\
\n        d._children.forEach(collapse);\
\n        d.children = null;\
\n      }\
\n    }\
\n  root.children.forEach(function(d){collapse(d);update(d)});\
\n  \
\n  function update(source) {\
\n  // Compute the new tree layout.\
\n  var nodes = tree.nodes(root).reverse(),\
\n  links = tree.links(nodes);\
\n\
\n  // Normalize for fixed-depth.\
\n  nodes.forEach(function(d) { d.y = d.depth * 180; });\
\
\n  // Declare the nodes…\
\n  var node = svg.selectAll("g.node")\
\n    .data(nodes, function(d) { return d.id || (d.id = ++i); });\
\
\n// Enter any new nodes at the parent\'s previous position.\
\n  var nodeEnter = node.enter().append("g")\
\n    .attr("class", "node")\
\n    .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })\
\n    .on("click", click);\
\n\
\n  nodeEnter.append("circle")\
\n    .attr("r", 10)\
\n    .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });\
\n\
\n  nodeEnter.append("text")\
\n    .attr("x", function(d) { \
\n      return d.children || d._children ? -13 : 13; })\
\n    .attr("dy", ".35em")\
\n    .attr("text-anchor", function(d) { \
\n      return d.children || d._children ? "end" : "start"; })\
\n    .text(function(d) { return d.name; })\
\n    .style("fill-opacity", 1e-6);\
\n \
\n var nodeUpdate = node.transition()\
\n      .duration(duration)\
\n      .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });\
\n  nodeUpdate.select("circle")\
\n    .attr("r", 10)\
\n    .style("fill", function(d) { return d._children ? "lightsteelblue" : "#fff"; });\
\n  nodeUpdate.select("text")\
\n    .style("fill-opacity", 1);\
\n  var nodeExit = node.exit().transition()\
\n    .duration(duration)\
\n    .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })\
\n    .remove();\
\n \
\n  nodeExit.select("circle")\
\n    .attr("r", 1e-6);\
\n \
\n  nodeExit.select("text")\
\n    .style("fill-opacity", 1e-6);\
\n  // Declare the links…\
\n  var link = svg.selectAll("path.link")\
\n    .data(links, function(d) { return d.target.id; });\
\n  // Enter the links.\
\n  link.enter().insert("path", "g")\
\n    .attr("class", "link")\
\n    .attr("d", function(d) {\
\n    var o = {x: source.x0, y: source.y0};\
\n    return diagonal({source: o, target: o});\
\n    });\
\n  // Transition links to their new position.\
\n  link.transition()\
\n    .duration(duration)\
\n    .attr("d", diagonal);\
\n\
\n  link.exit().transition()\
\n    .duration(duration)\
\n    .attr("d", function(d) {\
\n    var o = {x: source.x, y: source.y};\
\n    return diagonal({source: o, target: o});\
\n    })\
\n    .remove();\
\n  nodes.forEach(function(d) {\
\n    d.x0 = d.x;\
\n    d.y0 = d.y;\
\n  });\
\n}\
\n  nodes.forEach(function(d) {\
\n    d.x0 = d.x;\
\n    d.y0 = d.y;\
\n  });\
\n// Toggle children on click.\
\n function click(d) {\
\n  if (d.children) {\
\n    d._children = d.children;\
\n    d.children = null;\
\n  } else {\
\n    d.children = d._children;\
\n    d._children = null;\
\n  }\
\n  update(d);\
\n}\
  </script>\
  </body>\
  ';
  return script;
}
function countProperties(obj) {
    return Object.keys(obj).length;
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
module.exports = pageCreator;