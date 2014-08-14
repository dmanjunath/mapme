var db = require('./api/db.js');
var flaggedPosts = db.import(__dirname+'/../models/flagged_posts.js');
var Ratings = db.import(__dirname+'/../models/ratings.js');

exports.add = function(req, res){
  var body = req.body;
  flaggedPosts.newPost(JSON.stringify(body.post), body.landlordId, function(err, data){
    Ratings.deleteRating(body.post.id, function(e, d){
      res.send(200);
    });
  });
};

exports.update = function(req, res){
  var id = req.body.id;
  var landlordId = req.body.landlordId;
  var comment = req.body.comment;
  Ratings.updateRating(id, landlordId, comment, function(err, data){
    if(err) throw err;
    res.json(data);
  });
}