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
  
  for(var key in raw){
    // console.log(key)
    if(key != 'root'){
      var child = {};
      child["name"] = removeQuotes(key);

      if(countProperties(raw[key]) > 0){
        console.log(raw[key])
        var grandkids = new pageCreator(raw[key])
        grandkids.parent = this.parent
        var grandJSON = grandkids.getTreeJson();
        console.log(grandJSON)
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
  // console.log(JSON.stringify(finalJSON,null,2));
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
\n  root.x = height;\
\n  root.y = 0;\
\n  update(root);\
\n  root.children.forEach(collapse);\
\n  function collapse(d) {\
\n      if (d.children) {\
\n        d._children = d.children;\
\n        d._children.forEach(collapse);\
\n        d.children = null;\
\n      }\
\n    }\
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
\n  // Enter the nodes.\
\n  var nodeEnter = node.enter().append("g");\
\n      console.log(nodeEnter);\
\n      nodeEnter.attr("class", "node");\
\n      nodeEnter.attr("transform", function(d) { \
\n      return "translate(" + d.y + "," + (d.x) + ")"; });\
\n\
\n  nodeEnter.append("circle")\
\n    .attr("r", 10)\
\n    .style("fill", "#fff");\
\n\
\n  nodeEnter.append("text")\
\n    .attr("x", function(d) { \
\n      return d.children || d._children ? -13 : 13; })\
\n    .attr("dy", ".35em")\
\n    .attr("text-anchor", function(d) { \
\n      return d.children || d._children ? "end" : "start"; })\
\n    .text(function(d) { return d.name; })\
\n    .style("fill-opacity", 1);\
\n\
\n  // Declare the links…\
\n  var link = svg.selectAll("path.link")\
\n    .data(links, function(d) { return d.target.id; });\
\n  // Enter the links.\
\n  link.enter().insert("path", "g")\
\n    .attr("class", "link")\
\n    .attr("d", diagonal);\
\n\
}\
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