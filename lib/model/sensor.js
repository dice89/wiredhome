var mongoose = require('mongoose');


sensors = new mongoose.Schema({
	location: String,
	user: mongoose.Schema.Types.ObjectId,
	readings : [mongoose.Schema.Types.ObjectId],
	reading_type : String
	});

readings = new mongoose.Schema({
	ref_timestamp : Date,
	sensor_id: mongoose.Schema.Types.ObjectId,
	sum_value: Number,
	count_value: Number,
	datapoints: [Number]
	});


var Sensor = mongoose.model('Sensors', sensors);

var Reading = mongoose.model('Readings', readings);


Sensor.prototype.saveSensor= function (location,user,reading_type, fn){
	var sensor = this;

	sensor.location = location;
	sensor.user = user;
	sensor.reading_type = reading_type;
	if(!this.isNew){
		//sensor.updateSensor(location,user,fn);
	} 

	sensor.save(function(err){
		if(err) return fn(err);
		fn(null, sensor);
	});
}



Sensor.prototype.updateSensor = function(fn){
	var sensor = this;

	Sensor.findByIdAndUpdate(sensor._id, { $set: {location:sensor.location, user: sensor.user, reading_type: sensor.reading_type} }, function(err, sensorObj){
		if(err) return fn(err);
		fn(null, sensorObj);
	});
}

Sensor.prototype.deleteSensor = function(fn){

	//TODO
}

Sensor.prototype.addReading = function(unixtimestamp,datapoint, fn){
	var sensor = this;
	var searchDate = new Date(Date.now());

	searchDate.setMinutes(searchDate.getMinutes() - 10);
	Reading.find({sensor_id: sensor._id,  ref_timestamp: { $gt: searchDate  } }, function(err, reading){
		
		if(reading.length === 0){
			//array empty add new reading entry
			var reading_array = [];
			reading_array.push(datapoint);
			var reading = new Reading({ref_timestamp: Date.now(),sensor_id: sensor.id, sum_value:datapoint, count_value:1, datapoints:reading_array });
			
			reading.save(function(err, reading){
				if(err) return fn(err);
				console.log(reading);

				//update readings list in sensor, check performs on this, because probably not necassary

				Sensor.update({_id:sensor._id },{ $push:{"readings":reading._id } }, function(err){
					if(err) return fn(err);
					return fn();
				});

				
			});



		} else {
			//reading that fullfills query found so add datapoint to datapoints array
			Reading.update({_id: reading[0].id},
				{ 	$push:{"datapoints": datapoint} ,  
					$inc: {count_value: 1, sum_value: datapoint} } ,function(err){
					if(err) return fn(err);	
					return fn();
			});

		}

	})
	

}


// return only aggregate readings in a 10 minutes manner
Sensor.prototype.getReadings = function(fn){
	var sensor = this;
	Reading.find({sensor_id: sensor._id}, function(err, readings){
		if(err) return fn(err);
		return sensor.formatReadingChunks(readings,fn);
	});
}

/* from time an to time have to be date objects */

//TOBE TESTED
Sensor.prototype.getReadingsFromTo = function(from_time, to_time, fn){

	var sensor = this;
	Reading.find({ sensor_id: sensor._id, ref_timestamp: { $gt: from_time  }, ref_timestamp: { $lt: to_time  }}, function(err, readings){
		if(err) return fn(err);
		return sensor.formatReadingChunks(readings,fn);
	});
}


/* get all data for sensor at lowest aggregation level */
Sensor.prototype.getReadingsRaw = function(fn){

	var sensor = this;
	Reading.find({sensor_id: sensor._id}, function(err, readings){
		if(err) return fn(err);
		return sensor.formatRawReadingChunks(readings,fn);
	});
}

/*format data */
Sensor.prototype.formatReadingChunks = function(readings, fn){


		var res_reading = {};
		var res_readings = [];
		readings.forEach(function(reading){
			//compute value as average of 10 minutes
			res_reading = {};
			res_reading.value = reading.sum_value/reading.count_value
			res_reading.timestamp = reading.ref_timestamp;

			res_readings.push(res_reading);
		});

		return fn(null, res_readings);
}



/* format in a relational json structure that each datapoint has a timestamp  
at lowest aggregation level, which is basically no aggregation*/
Sensor.prototype.formatRawReadingChunks = function(readings, fn){
		
	var res_reading = {};
	var res_readings = [];
	//var time;
	// for missing time stamp construction
	var time_counter = 0;
	readings.forEach(function(reading){
		time_counter = 0;
		reading.datapoints.forEach(function(datapoint){

			//construct time stamp
			var time = new Date(reading.ref_timestamp.getTime());
			console.log(time);
			time.setMinutes(reading.ref_timestamp.getMinutes() + time_counter);
			console.log(time);
			//create result elem
			res_reading = {};
			res_reading.timestamp = time;
			res_reading.value = datapoint;


			res_readings.push(res_reading);
			time_counter = time_counter+1;
		});
	});

	return fn(null, res_readings);

}


Sensor.getSensorById = function(id, fn){
	Sensor.findOne({'_id':id},function(err,sensor){
		if (err) return fn(err);
			fn(null,sensor);

	});

}

Sensor.getSensorsByUserId = function(user_id, fn){
	Sensor.find({'user':user_id},function(err,sensors){
		if (err) return fn(err);
			fn(null,sensors);

	});

}

module.exports =Sensor;

/*
var test = new Sensor();
var t_sensor;
test.saveSensor('Room1',null,'TEMP', function(err, sensor){
	if(err) return console.log(err);
	console.log(sensor._id);
	t_sensor = sensor;
	t_sensor.location =  'Room2';
	t_sensor.updateSensor(function(err, sensor){
		if(err) return console.log(err);
		console.log(sensor._id);

	});

});


Sensor.getSensorById('532c71e4933229532f3ae658', function(err, test_sensor){
	if(err) console.log(err);
	test_sensor.addReading(22222,20.0, function(error){
		if(err) console.log(err);
		test_sensor.getReadingsRaw(function(err,readings){
			console.log(readings);
		})
		test_sensor.getReadings(function(err,readings){
			console.log(readings);
		})
	});



})

*/


