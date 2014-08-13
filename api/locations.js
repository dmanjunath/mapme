var db = require('../api/db.js');
var locations = db.import(__dirname+'/../models/locations.js');
var cities = require('cities');
var client = require('../lib/elasticsearch.js');


exports.add = function(req, res){
  var body = req.body;
  locations.create({name: body.city, state: body.state, zip: body.zip})
  .success(function(data){
    res.json(data);
  })
  .error(function(){
    res.send(400);
  });
};

exports.list = function(req, res){
  locations.findAll({where: {state: req.params.id}})
  .success(function(data){
    res.json(data);
  });
};

exports.lookup = function(req, res){
  var body = req.body;
  var city = cities.gps_lookup(body.lat, body.lon);
  if(city && city.city){
    res.json(city);
  }
  else {
    res.send(404);
  }
};

exports.typeahead = function(req, res){
  client.suggest({
    index: 'cities',
    body: {
      city: {
        text: req.body.text,
        completion: {
          field: "search"
        }
      }
    }
  }, function(err, response){
    res.json(response.city[0].options);
  });
}

exports.search = function(req, res){
  var body = req.body;
  var url = body.url + 'city/VA/Centreville';
  console.log(url);
  res.send(url);
};