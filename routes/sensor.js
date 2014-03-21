var User = require('../lib/user');
var Sensor = require('../lib/sensorModel');
var mongoose = require('mongoose');

exports.postsensordata= function(req,res,next){
	console.log(req.body);

	var sensor_id = req.body.sensorid;
	var timestamp= req.body.timestamp;
	var temp = req.body.temp;
	var humidity = req.body.humidity;

	console.log(Date.now());

	var readingjson = { timeStamp: Date.now(), temp: temp, humidity: humidity};

	//get sensor

	Sensor.getSensorById(sensor_id, function(err,sensor){
		if(err) return next(err);	
		if(sensor == null) return next(new Error('fail'));

		//update it
		sensor.updateReading(readingjson,function(err){
			if(err) return next(err);
				res.writeHead(200, {'Content-Type': 'text/plain'});
				res.end('success');
		});

	});


}
exports.showsensordataWS = function(req,res,next){
//get correct sensor from id
	var id = req.params.sensorid;

	Sensor.getSensorById(id, function(err, sensor){
		if(err) return next(err);
		var humidity_vec = [];
		var temp_vec = [];
		sensor.reading.forEach(function (reading){
		
			//TODO change database model
			var s = new Date(reading.timeStamp.getTime());

			console.log(s);
			var stamp= reading.timeStamp
	
			humidity_vec.push({y: parseFloat(reading.humidity), x:s.getTime()});
			temp_vec.push({y:parseFloat(reading.temp),x:s.getTime() });
		});

		res.writeHead(200, {'Content-Type': 'application/json'});
		res.end(JSON.stringify({sensorid:sensor.id, location:sensor.location, humidity: humidity_vec, temp:temp_vec}) );
	});

}

exports.showsensordata = function(req,res,next){
//get correct sensor from id
	var id = req.params.sensorid;

	Sensor.getSensorById(id, function(err, sensor){
		if(err) return next(err);
		var humidity_vec = [];
		var temp_vec = [];
		sensor.reading.forEach(function (reading){
			var newdate = new Date(reading.timeStamp);
			humidity_vec.push({y:reading.humidity, x:reading.timeStamp.getTime()});
			temp_vec.push({y:reading.temp,x:reading.timeStamp.getTime() });
		});

		res.render('sensor',{title: 'Readings for: '+id, id: id, temp: temp_vec, humidity: humidity_vec});
	});

}

exports.registersensor = function(req,res,next){

	var user_name= req.body.user;
	var location = req.body.location;
	User.getByName(user_name, function(err, user){
		if(err) return next(err);
		var sensor = new Sensor();

		sensor.saveSensor(location,user, function(err){
			if(err) return next(err);

			res.writeHead(200, {'Content-Type': 'text/plain'});
			res.end('success');
		});
	});
}