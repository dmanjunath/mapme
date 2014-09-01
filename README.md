mapme
=====
mapme is an npm module to help visualize an applications dependency structure with an easy to understand tree visualization. Simply run map me on the starting point of your app(eg app.js or server.js) and mapme will open an interactive d3 based tree showing you what your file dependencies are for your project. 

#Getting Started
To install mapme, you can either:

install through npm

     npm (-g) install mapme

or clone the source


#Running mapme
mapme takes two arguments

     mapme path/to/file.js [outputFile.html OPTIONAL]

path/to/file.js is the entry point of your node.js app(like app.js usually). The path to the file can be relative if you have mapme installed globally, or absolute if you're calling mapme from the bin directory.

If you installed mapme locally as a npm module, you can find it in your project's 
     
     /node_modules/.bin/mapme

#Created By
Hareesh Nagaraj     
Dheeraj Manjunath

#License
MIT
