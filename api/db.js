var Sequelize = require('sequelize');
// var config = require('../config.js');

// var sequelize = new Sequelize('test',
//                               'root',
//                               null, {
 
//   dialect: 'mysql',

//   host: config.get('mysql:host')
// });
// 
var sequelize = new Sequelize('tlg', 'postgres', "password", {
  host: '127.0.0.1',
  port: 5432,
  dialect: 'postgres',
  omitNull: true

});

module.exports = sequelize;