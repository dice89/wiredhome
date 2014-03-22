
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

app.locals.dbconnection = mongoose.connect('mongodb://localhost/wiredhome');

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

//TODO build middleware that secures sensor path so it's only available after login

//sensor ui stuff
app.get('/sensor/show/:sensorid', sensor.showSensor);
//Sensor registration for user
app.get('/sensor/registeruser', sensor.showRegisterSensorForUser);
app.post('/sensor/registeruser', sensor.registersensorforUser);
//Sensor overview for user
app.get('/sensor', sensor.showSensors);

//sensor api stuff
app.post('/api/updatesensor', sensor.receiveSensorData);
app.post('/api/registersensor', sensor.registersensor);
app.get('/api/getsensordata/:sensorid', sensor.getsensordata );




http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
