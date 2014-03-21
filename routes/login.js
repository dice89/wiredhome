var User = require('../lib/user');
exports.form = function(req,res){
	res.render('login', {title:'Login'});
}

exports.submit = function(req,res,next){

	var data = req.body.user;


	User.authenticate(data.name,data.pass, function(err,user){
		if(err)return next(err);

		if(user){
			req.session.uid = user._id;
			console.log('user logged in with: ' +req.session.uid);
			res.redirect('/');
		}else {
			console.log('log in failed');
			res.error("Sorry invalid Credentials");
			res.redirect('back');
		}
	});

}

exports.logout = function(req,res){

	console.log('logout user with uid: ' +req.session.uid);
	req.session.destroy(function(err){
		if(err) throw err;
		res.redirect('/');
	})
}