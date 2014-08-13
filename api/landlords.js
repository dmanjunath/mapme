var db = require('../api/db.js');
var landlords = db.import(__dirname+'/../models/landlords.js');
var _ = require('lodash');
var client = require('../lib/elasticsearch.js');

exports.add = function(req, res){
  var body = req.body;
  var done = _.after(2, function(data){
    res.json(pgData);
  });
  var pgData;

  landlords.create({name: body.name, city: body.city, state: body.state, zip: body.zip, address: body.address})
  .success(function(data){
    pgData = data;
    done();
  })
  .error(function(){
    res.send(400);
  });

  client.create({
    index: 'ratings',
    type: 'landlord',
    body: {
      name: body.name, 
      city: body.city, 
      state: body.state, 
      zip: body.zip, 
      address: body.address
    }
  }, function(err, response){
    done();
  });
};

exports.list = function(req, res){
  var x = req.params.id.split(",");
  var city = x[0].trim();
  var state = x[1].trim();
  landlords.getLandlordsInCity(city, state, function(err, data){
    if(err) throw err;
    data.sort(function(a, b){
     var nameA=a.name.toLowerCase(), nameB=b.name.toLowerCase()
     if (nameA < nameB) //sort string ascending
      return -1 
     if (nameA > nameB)
      return 1
     return 0 //default return value (no sorting)
    })
    res.json(data);
  });
};

function dynamicSort(property) {
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    return function (a,b) {
        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
        return result * sortOrder;
    }
}

exports.get = function(req, res){
  landlords.find({where: {id: req.params.id}})
  .success(function(data){
    res.json(data);
  });
};

exports.delete = function(req, res){
  landlords.deleteLandlord(req.params.id, function(err, r){
    if(err) throw err;
    res.send(200);
  });
};

exports.typeahead = function(req, res){
  client.search({
    index: 'landlords',
    type: 'landlord',
    body: {
      query: {
        query_string : {
          query : req.body.text + "*", 
          default_field: "name"
        }  
      }
    }
  // client.suggest({
  //   index: 'landlords',
  //   body: {
  //     landlord: {
  //       text: req.body.text,
  //       completion: {
  //         field: "search_suggest"
  //       }
  //     }
  //   }
  }).then(function (data) {
    console.log(data);
      // var hits = _.pluck(data.hits.hits, '_source');
      res.json(data.hits.hits);
      // res.json(data.landlord[0].options);
  }, function (err) {
      console.trace(err.message);
  });
};