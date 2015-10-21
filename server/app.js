var _ = require("underscore");
var express = require('express');
//var hashlib = require('hashlib');
var formidable = require('formidable');
var sys = require('sys');
var fs = require('fs');
var im = require('imagemagick');
var app = module.exports = express.createServer(

);
var parseCookie = require('connect').utils.parseCookie;

// Configuration

app.configure(function(){

  app.set('views', __dirname + '/views');
  app.register('.html', require('ejs'));
  app.set('view engine', 'html');

  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
  
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

var createNewUser = function(callback) {
	app.redisClient.incr("userIdKey", function() {
	  app.redisClient.get("userIdKey", function(err, userid) {		
	  	
	  	var accessKey = new Date().getTime() + "r" + Math.random();        	
	  	var accesskeyHashed = hashlib.md5(accessKey);
  	
  		//TODO CLientuser anlegen mit weniger infos und den zum client schicken
  	
		  var user = {
		    id: userid,
		    name: "Guest " + userid,
		    icon: "/images/people1.png",
		    userroom: null,
		    usergame: null,
		    accessKey: accesskeyHashed,
		    password: null,
		    usersalt: null,
		    serversalt: null,
		    usernameChanged: false,
		    hasPassword: false,		    
		  };	 
		  
		  // In DB speichern
		  client.hset("user", userid, JSON.stringify(user), function() {	
			  client.hset("userNameToId", user.name, user.id, function() {		  					  			
			    callback(reduceUserObject(user));	  				
			  }); 		  		  					  			
		     				
		  }); 
		  

	  });
	});
}

app.get('/', function(req, res){
	
	// Falls es schon ein Cookie gibt
	if (req.headers.cookie != undefined) {
		
		// Cookie auslesen
		var cookie = parseCookie(req.headers.cookie);
		
		console.log("Der User hat schon 'n Cookie");
		
		// Prüfen ob das Cookie gültig ist		
		// User aus DB laden
	  app.redisClient.hget("user", cookie.userid, function(err, userjson) {
	  	
      var user = JSON.parse(userjson);

      // Wenn der Access-Key stimmt
      if (user != null && user.accessKey === cookie.accesskey) {
      	console.log("User ist Cool. Access-Key stimmt");
      	
      	res.render('index');	
      }
      else {
      	console.log("User ist uncool. Falscher Access-Key");
      	// Neuen User anlegen
				createNewUser(function(user) {
					
			  	// Cookie setzen
			  	var expire = 1000*60*60*24*365*10; 
			  	res.cookie('userid', user.id, { expires: new Date(Date.now() + expire) });
			  	res.cookie('accesskey', user.accessKey, { expires: new Date(Date.now() + expire) });
			  		  	
			  	// Index rendern
			  	res.render('index');			
				});      	
      }
      
   	});


	}	
	// Falls noch kein Cookie gibt
	else {
		// Neuen Benutzer erstellen
		createNewUser(function(user) {
			
	  	// Cookie setzen
	  	var expire = 1000*60*60*24*365*10; 
	  	res.cookie('userid', user.id, { expires: new Date(Date.now() + expire) });
	  	res.cookie('accesskey', user.accessKey, { expires: new Date(Date.now() + expire) });
	  		  	
	  	// Index rendern
	  	res.render('index');			
		});
	}
		
});

app.get('/mobile', function(req, res){
  console.log("mobile");
  res.render('mobile');
});


app.post('/avatar', function(req, res, next){
  var f = new formidable.IncomingForm();
  f.parse(req, function(err, fields, files){
		//res.redirect('/#games/maumau');
    // Wenn eine Datei dabei ist
    //Größe prüfen
    if ((files.f != undefined) &&
    		(files.f.length <= 3*1024*1024)) {



				// Falls es schon ein Cookie gibt
				if (req.headers.cookie != undefined) {
					
					// Cookie auslesen
					var cookie = parseCookie(req.headers.cookie);
					
					console.log("Der User hat schon 'n Cookie");
					
					// Prüfen ob das Cookie gültig ist		
					// User aus DB laden
				  app.redisClient.hget("user", cookie.userid, function(err, userjson) {
				  	
			      var user = JSON.parse(userjson);
			
			      // Wenn der Access-Key stimmt
			      if (user != null && user.accessKey === cookie.accesskey) {
			      	console.log("User ist Cool. Access-Key stimmt");
			      	
							// Resizen,c rop, move
							im.crop(
								{
								  srcPath: files.f.path,
								  dstPath: 'public/images/avatar/'+user.id+'.png',
								  format: 'png',
								  width: 100,
								  height: 100,
								  quality: 1
								}, 
								function(err, stdout, stderr){
									if (err === null) {
								 	 user.icon = 'images/avatar/'+user.id+'.png'										
									}
									
									fs.unlink(files.f.path);
								  app.redisClient.hset("user", user.id, JSON.stringify(user), function() {
								  	res.redirect(fields.ref);
								  });
								  
								}
							); 			
			
			      }
			
			   	});
			
			
				}	

       			
		}
		else {
			res.redirect(fields.ref);
		}

  });	







});

/*
 * 
 */
app.listen(4000);

// Now and Redis
var nowjs = require("now")
var everyone = nowjs.initialize(app, {socketio: {'log level': 2, 'reconnect': false}});
var redis = require("redis");
var client = redis.createClient();

app.nowjs = nowjs;
app.everyone = everyone;
app.redis = redis;
app.redisClient = client;





client.on("error", function (err) {
    console.log("Error " + err);
});

everyone.connected(function(){
  var self = this;

});

everyone.now.logMeIn = function(userid, accessKey, callback) {
	var self = this;
	
	// User aus DB laden
  app.redisClient.hget("user", userid, function(err, userjson) {
  	
    var user = JSON.parse(userjson);

    // Wenn der Access-Key stimmt
    if (user != null && user.accessKey === accessKey) {
    	
    	// Wenn User schon eine Client-ID hat, ausloggen
    	console.log("user.clientid: " + user.clientid );
    	if (user.clientid != null) {
    		nowjs.getClient(user.clientid, function() {
    			console.log("EIN USER AUSLOGGEN DER SCHON DA WAR");
    			console.log("AAAClientID: " + user.clientid);
    			if (this.now != undefined) {
    				this.now.showOtherTabWarning();
    			}
    			
    			if (this.socket != undefined) {
    				this.socket.emit('disconnect');
    			}
    			
    		});
    	}
    	
    	// Client-ID zum User hinzufügen
    	user.clientid = self.user.clientId; 
		  client.hset("user", userid, JSON.stringify(user), function() {	
			  // Client-ID zu userid mapping
			  client.hset("clientid", user.clientid, user.id);  		 
			  console.log("Nowjs: User ist Cool. Access-Key stimmt. Eingeloggt!");
			  // User zum Client schicken 		  		
			  
			  var reducedUser = reduceUserObject(user);			  			
		    self.now.me = reducedUser; 		    			
		    self.now.userDetailsArrived(reducedUser);
		    
		    callback(reducedUser);	
		  });    
		  
    }
    else {
      console.log("Nowjs: User ist uncool. Access-Key falsch!");
      self.now.showErrorMessage("Fehler beim Login");
    }
  });	
}

everyone.now.logMeInAsDifferentUser = function(username, callback) {
	var self = this;
	// User id anhand des Namens auslesen
  app.redisClient.hget("userNameToId", username, function(err, userid) {	
		if (userid != null) {
			// Benutzer auslesen
			app.redisClient.hget("user", userid, function(err, userjson) {
				var user = JSON.parse(userjson);
				if (user != null && user.hasPassword === true) {
					callback(user.usersalt, function(userpw, callback2) {
						var pw = hashlib.md5(userpw + user.serversalt);
						if (pw === user.password) {
							callback2(user.id, user.accessKey);
						}
						else {
							self.now.showErrorMessage("Das Passwort stimmt nicht.");	
						}
					});
				}
				else {
					self.now.showErrorMessage("Den Benutzer gibt es nicht.");	
				}
			});
		}
		else {
			self.now.showErrorMessage("Den Benutzer gibt es nicht.");	
		}		
  });
}

everyone.now.giveMeTheUserDetails = function() {
	console.log(this.now.user);
}


everyone.disconnected(function(){
	
  console.log("Left: " + this.now.name);

  

});


var maumau = require("./maumauapp");
maumau.initializeMauMau(app);

var reduceUserObject = function(user) {
	return {
		id: user.id,
		name: user.name,
		icon: user.icon,
		userroom: user.userroom,
		usergame: user.usergame,
		usernameChanged: user.usernameChanged,
		hasPassword: user.hasPassword,
		accessKey: user.accessKey,
		usersalt: user.usersalt
	};

}

