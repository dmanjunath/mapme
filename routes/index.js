
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.redirect('/home');
};

exports.app = function(req, res){
  console.log("App");
  res.send("Hello There");
}

exports.partials = function (req, res) {
  var name = req.params.name;
  res.render('partials/' + name);
};