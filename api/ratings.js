var db = require('../api/db.js');
var ratings = db.import(__dirname+'/../models/ratings.js');
var _ = require('lodash');
var client = require('../lib/elasticsearch.js');

exports.add = function(req, res){

  var pgData;
  var done = _.after(2, function(data){
    res.json(pgData);
  });

  var body = req.body;
  ratings.create({
    landlordId: body.landlordId, 
    friendliness: body.friendliness, 
    reliability: body.reliability, 
    ease: body.ease, 
    value: body.value, 
    comment: body.comment, 
    propertyAddress: 
    body.propertyAddress,
    city: body.city,
    state: body.state
  })
  .success(function(data){
    pgData = data;
    done();
  })
  .error(function(err){
    if(err) throw err;
    res.send(400);
  });

  client.create({
    index: 'ratings',
    type: 'rating',
    body: {
      landlordId: body.landlordId,
      landlordName: body.landlordName,
      friendliness: body.friendliness, 
      reliability: body.reliability, 
      ease: body.ease, 
      value: body.value, 
      comment: body.comment, 
      propertyAddress: body.propertyAddress,
      city: body.city,
      state: body.state
    }
  }, function(err, response){
    done();
  });

};

exports.list = function(req, res){
  ratings.getAllRatingsForLandlord(req.params.id, function(err, data){
    res.json(data);
  });
};