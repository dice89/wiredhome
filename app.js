
/**
 * Module dependencies.
 */
var mongoose = require('mongoose');
var express = require('express');
var routes = require('./routes');
var user = require('./lib/middleware/user');
var http = require('http');
var path = require('path');
var register = require('./routes/register');
var login = require('./routes/login');
var sensor = require('./routes/sensor')
var messages = require('./lib/messages');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use(user);
app.use(messages());
app.use(app.router);

app.locals.dbconnection = mongoose.connect('mongodb://localhost/shoutbox');

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}



app.get('/', routes.index);
app.get('/register',register.form);
app.post('/register', register.submit);


app.get('/login', login.form);
app.post('/login', login.submit);
app.get('/logout',login.logout);


app.post('/updatesensor', sensor.postsensordata);
app.post('/registersensor', sensor.registersensor);
app.get('/sensor/:sensorid', sensor.showsensordata);
app.get('/sensorws/:sensorid', sensor.showsensordataWS);
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
