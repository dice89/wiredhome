var User = require('../lib/user');
var Sensor = require('../lib/model/sensor.js');
var mongoose = require('mongoose');


//api method
exports.receiveSensorData= function(req,res,next){
	console.log(req.body);
	//extract sensor array

	var sensor_array = red.body.sensors;

	try {
		sensor_array.forEach(function(sended_sensor){

		Sensor.getSensorById(sended_sensor.id, function(err,sensor){
			if(err) return next(err);	
			if(sensor == null) return next(new Error('fail'));

			//add Reading
			sensor.addReading(sended_sensor.timestamp, sended_sensor.value,function(err){
				if(err) return next(err);
					res.writeHead(200, {'Content-Type': 'text/plain'});
					res.end('success');
			});

		});

		});
	}finally {
		//res.writeHead(200, {'Content-Type': 'text/plain'});
		//res.end('success');
	}



}

//api method
exports.getsensordata = function(req,res,next){
//get correct sensor from id
	var id = req.params.sensorid;

	Sensor.getSensorById(id, function(err, sensor){
		if(err) return next(err);


		sensor.getReadingsRaw(function(err,readings){
			if(err) return next(err);

			res.json(readings);
		});
	});

}

// api method
/* for initial registration of sensor, at this point in time no user and location is known */
exports.registersensor = function(req,res,next){

	var type = req.body.sensor_type;

	User.getByName(user_name, function(err, user){
		if(err) return next(err);
		var sensor = new Sensor();
		
		sensor.saveSensor(null,null,type, function(err, n_sensor){
			if(err) return next(err);
				res.writeHead(200, {'Content-Type': 'text/plain'});
				res.end(n_sensor._id);
	});

	});
}

/* ############ Begin HTML Part ############### TODO outsource in other router*/



exports.showRegisterSensorForUser = function(req,res){
	res.render('sensor/registersensor', {title: 'Register Sensor', username: req.user.name});
}

/* for registration of the user via html forms*/
exports.registersensorforUser = function(req,res,next){

	var sensor_id = req.body.sensor.id

	var user_name = req.body.sensor.user;

	var location = req.body.sensor.location;

	Sensor.getSensorById(sensor_id, function(err, sensor){
		if(err) return next(err);
		User.getByName(user_name,function(err, user){
			if(err) return next(err);
			sensor.user = user._id;
			sensor.location = location;
			sensor.updateSensor(function(err, sensor){
				if(err){
					res.error(err.toString());
					res.redirect('back');
				}else {
					res.redirect('/sensor');
				}
			});
		});
	});
}


exports.showSensors = function(req,res,next){

	//get correct user id 

	var user = req.user._id;
	var res_sensors = [];
	Sensor.getSensorsByUserId(user, function(err, sensors){
		if(err) return next(err);
		
		var res_sensor ={};

		for(sensor in sensors){
			res_sensor = {};
			res_sensor.id = sensors[sensor]._id;
			res_sensor.location = sensors[sensor].location;
			res_sensor.type = sensors[sensor].reading_type;
			res_sensors .push(res_sensor);
		}
	

		res.render('sensor/sensors.ejs',{title: 'Overview Sensors', sensors: res_sensors});
	});
}


exports.showSensor = function(req,res,next){

	//get correct user id 
	var sensorid = req.params.sensorid;
	

	Sensor.getSensorById(sensorid, function(err, sensor){
		if(err) return next(err);
		res.render('sensor/sensor.ejs',{title: 'Readings for Sensor' + sensorid + ' at location: '+sensor.location, id:sensorid});
	});
}
