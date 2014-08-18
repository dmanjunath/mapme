/*

This file simply contains some attributes of the tree, so the user can easily display them.

*/
var pageConfig = {
  width : '2000', 
  height : 'window.innerHeight || document.body.clientHeight',     //This matches the height of the body,
  duration: '500',              //duration for transitions
  strokeColor: 'steelblue',     //color of stroke for each node
  strokeWidth: '1.5px',         //thickness of the stroke around each node
  openColor: '#fff',            //color of nodes that are open
  closedColor: 'lightsteelblue', //color of nodes that can be opened
  linkColor: '#FFBAD2',            //color of the connections between nodes, or links
  linkWidth: '1.5px'            //thickness of the links between nodes - be sure to include px at the end
};
module.exports = pageConfig;