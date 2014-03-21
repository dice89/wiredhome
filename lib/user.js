var mongoose = require('mongoose');
var bcrypt = require('bcrypt');




var users = new mongoose.Schema({
	name: String,
	pass: String
});


var User = mongoose.model('User', users);

User.prototype.configureUser= function(data,fn){
	var user = this;

	for(var key in data){
		user[key] = data[key];
	}

}

User.prototype.saveUser = function(fn){
	var user = this;
	if(!user.isNew){
		this.updateUser(fn);
	}


	user.save(function(err){
		if(err) return fn(err);
		fn();
	});
}

User.prototype.updateUser = function(fn){
	var user = this;

	User.findByIdAndUpdate(user._id, { $set: {name:user.name, pass: user.pass} }, function(err, userObj){
		if(err) return fn(err);
		fn();
	});
}

User.getById = function(id, fn){
	User.findOne({'_id':id},function(err,user){
		if (err) return fn(err);
			fn(null,user);

	});
}

User.getByName=function(name,fn){
	User.findOne({'name':name}, function(err, user){
		if(err) return fn(err);
		fn(null, user);
	});
}

User.authenticate = function(name,pass, fn){
	User.getByName(name, function(err, user){

		if(err) return fn(err);

		if(user === null) return fn(null,null);
		//return user
		if(user.pass == pass)return fn(null,user);
		fn();
	})

}

module.exports = User;


