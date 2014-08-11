/*
pageCreator is the class that accepts the nodes from fileParser and produces the appropriate D3 graph page
*/
function pageCreator(nodes){
  this.nodes = nodes;
  this.root;

}

pageCreator.prototype.create = function(){    //used to create the page that contains everything we need
  this.root = this.nodes['root'];
  var fs = require('fs');
  var writeStream = fs.createWriteStream('dependencies.html','w');
  writeStream.write(JSON.stringify(this.nodes),'UTF-8',function(error){
  });
}

module.exports = pageCreator;