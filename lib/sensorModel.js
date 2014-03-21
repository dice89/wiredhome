var mongoose = require('mongoose');

sensors = new mongoose.Schema({
	location: String,
	user: mongoose.Schema.Types.ObjectId,
	reading : [{ timeStamp: Date, temp: String, humidity: String}]
	});


var Sensor = mongoose.model('Sensor', sensors);


Sensor.prototype.saveSensor= function (location,user, fn){
	var sensor = this;

	sensor.location = location;
	sensor.user = user;
	if(!this.isNew){
		sensor.updateSensor(location,user,fn);
	} 

	sensor.save(function(err){
		if(err) return fn(err);
		fn();
	});
}

Sensor.prototype.updateSensor = function(fn){
	var sensor = this;

	Sensor.findByIdAndUpdate(sensor._id, { $set: {location:sensor.location, pass: sensor.user} }, function(err, sensorObj){
		if(err) return fn(err);
		fn(sensorObj);
	});
}

Sensor.prototype.updateReading = function(reading, fn){
	//reading is proper json object
	var sensor = this;

	Sensor.update({_id: sensor.id},{$push:{"reading": reading}},function(err){
		if(err) return fn(err);
		fn();
	});

}



Sensor.getSensorById = function(id, fn){
	Sensor.findOne({'_id':id},function(err,sensor){
		if (err) return fn(err);
			fn(null,sensor);

	});

}

module.exports =Sensor;
