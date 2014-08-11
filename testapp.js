
/**
 * Module dependencies
 */

var express = require('express'),
  routes = require('./routes'),
  api = require('./routes/api'),
  http = require('http'),
  connect = require('connect'),
  RedisStore = require('connect-redis')(connect),
  path = require('path'),
  config = require('./config/config.json');

var cluster = require("cluster");
var numCPUs = require("os").cpus().length;

var app = module.exports = express();


/**
 * Configuration
 */

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.static(path.join(__dirname, 'public')));

process.env.NODE_ENV = config.run_level;

var bodyParser = express.bodyParser;
// development only
if (app.get('env') === 'development') {
  app.use(express.errorHandler());
}

app.use(express.cookieParser());
app.use(express.session({
  // key: 'tlg.sid',
  // store: new express.session.MemoryStore(),
  secret: 'asdfghjk,nytchycvikgvkjh',
  store: new RedisStore({host: '127.0.0.1', port: 6379}),
  cookie: {path: '/', httpOnly: true, maxAge: 14400000}
}));

app.use(app.router);
// production only
if (app.get('env') === 'production') {
  // TODO
};

// http://www.9bitstudios.com/2013/09/express-js-authentication/
var staffAuth = function(request, response, next) {
  if (request.session.currentUser && request.session.currentUser.staff) {
    return next();
  }
  else{
    response.send(401);
  }
};

/**
 * Routes
 */

// serve index and view partials
// app.get('/', routes.index);
app.get('/home', function(req, res){
  if(req && req.session && !req.session.loggedIn){
    req.session.loggedIn = false;
  }
  res.render('index', {session: req.session, env: process.env.NODE_ENV});
});
app.get('/app', routes.index);
app.get('/partials/:name', routes.partials);

// JSON API
app.get('/api/name', api.name);

var locations = require('./api/locations.js');
app.post('/locations', locations.add);
app.get('/locations/:id', locations.list);
// app.post('/locations/lookup', locations.typeahead);
app.post('/locations/search', locations.search);

app.post('/city/lookup', locations.typeahead);

var landlords = require('./api/landlords.js');
app.post('/landlord', landlords.add);
app.get('/landlord/list/:id', landlords.list);
app.get('/landlord/:id', landlords.get);
app.delete('/landlord/:id', staffAuth, landlords.delete);
app.post('/landlord/lookup', landlords.typeahead);

var ratings = require('./api/ratings.js');
app.post('/rating', ratings.add);
app.get('/rating/list/:id', ratings.list);

var flagging = require('./api/flagging.js');
app.post('/flag', staffAuth, flagging.add);
app.put('/edit', staffAuth, flagging.update);

app.get('/acccessTheLoginHomie', function(req, res){
  res.render('login', {session: req.session});
});

app.get('/logout', function(req, res){
  req.session.destroy(function(){
    res.redirect('/');
  });
});

app.get('/user/current/', function(req, res){
  res.send(req.session.currentUser);
});

var auth = require('./routes/authentication.js');
app.post('/auth/authenticate/login', bodyParser(), auth.login);
app.post('/auth/authenticate/create', bodyParser(), auth.create);
// redirect all others to the index (HTML5 history)
app.get('*', routes.index);

/**
 * Start Server
 */

if (cluster.isMaster) {
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", function(worker, code, signal) {
    cluster.fork();
  });
} else {
  http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
  });
}

// http.createServer(app).listen(app.get('port'), function () {
//   console.log('Express server listening on port ' + app.get('port'));
// });
