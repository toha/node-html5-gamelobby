var _ = require("underscore");
var eventEmitter = require('events').EventEmitter;
var events = new process.EventEmitter();
var hashlib = require('hashlib');

var app = null;

exports.initializeMauMau = function(a) {
	app = a;
	//console.log('Hello World');
	
	app.everyone.now.giveMeTheRooms = function(callback) {
		//console.log("--- giveMeTheRooms ---");
		// Räume auslesen
		var self = this;
		
		var rooms = generateRoomList(function(rooms) {
			// Und zum Client schicken
			callback(rooms);

		});
		
		// Zum Client senden
		
	};
	
	
	app.everyone.now.createRoom = function(roomname, options, callback) {
		//console.log("--- createRoom ---");
		var self = this;
		
		// TODO: Raumname prüfen
		
		
		// Optionen prüfen
		var maxPlayers = 2;
		var reaction = 15;
		var deck = 32
		if (options.opponents == 3) maxPlayers = 3;
		else if (options.opponents == 4) maxPlayers = 4;	
		else if (options.opponents == 5) maxPlayers = 5;		
		//console.log(options.reaction);
		if (options.reaction == 30) reaction = 30;
		else if (options.reaction == 60) reaction = 60;		
		if (options.deck == "52er") deck = 52;
		
	  
	  //console.log(self.now.user + " is going to create room " + roomname);
		
	  // User holen
	  
	  // User anhand der Client-iD auslesen
	  app.redisClient.hget("clientid", self.user.clientId, function(err, userid) {
		  app.redisClient.hget("user", userid, function(err, userjson) {
		    var user = JSON.parse(userjson);
		    if (user != null && user.userroom == null) {
		
		      // Neuen Raum anlegen
		      app.redisClient.incr("roomid", function() {
		        app.redisClient.get("roomid", function(err, roomid) {
		          var room = {
		            id: roomid,
		            name: roomname,
		            players: [],
		            playerCount: 0,
		            maxPlayers: maxPlayers,
		            reactionTime: reaction,
		            deckType: deck,
		            adminuser: null,
		            bannlist: [],
		            closed: false,
		            changed: false,
		          };
		          //console.log("room: " + JSON.stringify(room));
		          app.redisClient.hset("room", roomid, JSON.stringify(room));
		
							// Benutzer zum angelegten Raum leiten
							self.now.navigateUser("games/maumau/room/"+roomid);
							
							// callback aufrufen
							if (callback != undefined) {
								callback(roomid);
							}
		        });    
		      });     
		
		    }
		    else {
	      	
	      	self.now.showErrorMessage("Du bist bereits in einem Raum. Du musst diesen erst verlassen um einen neuen zu betreten");	    	
		    }
		
		  });
		});
	
	};	
	
	app.everyone.now.joinRoom = function(roomid) {
	  var self = this;
	  ////console.log(this.now.user.name + " is going to join room "+ roomid);
		
	
	  // User holen
	  app.redisClient.hget("clientid", self.user.clientId, function(err, userid) {
	  	//console.log("Userid: "+userid);
		  app.redisClient.hget("user", userid, function(err, userjson) {
		  	var user = JSON.parse(userjson);
		    // Raum holen    
		    app.redisClient.hget("room", roomid, function(err, roomjson) {
		    	
		    	if (roomjson == null || user == null) {
		    		self.now.showErrorMessage("Den Raum gibt es nicht (mehr).");
		    		self.now.navigateUser("games/maumau")
		    		self.now.removeRoom();
		    		return;
		    	}
		    	
		      
		      var room = JSON.parse(roomjson);
		      var roomgroup = app.nowjs.getGroup('room'+roomid);
		      console.log("room.closed: " + room.closed );
		      if (room.playerCount >= room.maxPlayers) {
		      	//console.log("Der Raum ist leider voll :-(");
		      	self.now.showErrorMessage("Der Raum ist leider voll :-(");	
		    		self.now.navigateUser("games/maumau")
		    		self.now.removeRoom();
		    		return;		      	      	
		      }	   
		      else if (_.indexOf(room.bannlist, user.id) != -1) {
		      	self.now.showErrorMessage("Du hast hier Hausverbot");	
		    		self.now.navigateUser("games/maumau")
		    		self.now.removeRoom();		      	
		      }  
					// wenn der Raum abgeschlossen ist
					else if (room.closed === true) {
		      	self.now.showErrorMessage("Der Raum ist abgeschlossen");	
		    		self.now.navigateUser("games/maumau")
		    		self.now.removeRoom();		
					}
		      // Raum ist nicht voll also joinen
		      else if (user != null && user.userroom == null && room != null) {
						//console.log("User joint einem Raum");
		        room.changed = true;
						room.playerCount += 1;
						
		  
		        // Raum in User eintragen
		        user.userroom = roomid
		        app.redisClient.hset("user", user.id, JSON.stringify(user));
		
		        // User in Raum eintragen  
		        var newplayer = {
		          id: user.id,
		          name: user.name,
		          icon: user.icon
		        };
		        room.players.push(newplayer);
		        // An die Raumgruppe (ohne den neuen User) schicken dass einer gejoint hat
		        roomgroup.now.userJoinedRoom(newplayer, room);
		        
		        // Wenn der Spieler der einzige ist, wird er Admin (Bei neuen Räumen)
		        if (room.playerCount === 1) {
		        	room.adminuser = user.id;
		        }
		        
		        app.redisClient.hset("room", roomid, JSON.stringify(room));
		
		        // User zur Now-Gruppe hinzufügen	        
		        roomgroup.addUser(user.clientid);		
						
		        // Raum im Client anzeigen
					  self.now.showRoomDetails(room);
					  //roomgroup.now.showRoomDetailUpdates(room);
					  
					  // Falls die Raumsuche noch läuft
					  events.emit('removeMeFromQuickList'+user.id, -1);
					  
			      chatmsg = {
		      		name: "",
		      		icon: "/images/blank.png",
			      	msg: user.name + " hat den Raum betreten",
			      	time: new Date().getHours() + ":" + new Date().getMinutes() 		      	
			      }
			      roomgroup.now.newChatMessage(chatmsg);						  
						  					  
		        
		        
		        // TODO Neuen Benutzer zu den anderen Tischen schicken
		                      
		
		      }
		      else {
		      	// TODO: Fehlermeldung anzeigen, dass Benutzer schon einem Raum ist, und diesen erst verlassen muss
		      	//console.log("bla");
		      	self.now.showErrorMessage("Bla");
		      }
		    });
		  });
		});
	
	};	
	
	



	app.everyone.now.leaveRoom = function() {
	  var self = this;
	
	  // User holen
	  app.redisClient.hget("clientid", self.user.clientId, function(err, userid) {
		  app.redisClient.hget("user", userid, function(err, userjson) {
		    var user = JSON.parse(userjson);  
				leaveRoom(user, self);
		  });
		});
	}
	

	app.everyone.now.postChatMessage = function(msg) {
	  var self = this;
	  if (msg.length > 500) {
	  	msg = msg.substr(0, 500);
	  }
		// TODO msg sauber machen und leere Message verhindern
		
	
		// TODO prüfen ob user.userroom leer ist
	
	  // User holen
	  app.redisClient.hget("clientid", self.user.clientId, function(err, userid) {
		  app.redisClient.hget("user", userid, function(err, userjson) {
		    var user = JSON.parse(userjson);  
		    app.redisClient.hget("room", user.userroom, function(err, roomjson) {
		      
		      // Prüfen ob es
		      
		      var room = JSON.parse(roomjson);
		      var roomgroup = app.nowjs.getGroup('room'+room.id);
		      

		      chatmsg = {
	      		name: user.name,
	      		icon: user.icon,
		      	msg: msg,
		      	time: new Date().getHours() + ":" + new Date().getMinutes() 		      	
		      }
		      // Nachricht an die anderen Posten
		      roomgroup.now.newChatMessage(chatmsg);
		      		      
		    });
		  });
		});
	}	
	
	app.everyone.now.getQuickGameResult = function(options, callback) {
		app.redisClient.hget("clientid", this.user.clientId, function(err, userid) {
			getRoomListByOptions(options, function(rooms) {
				callback(rooms.length);
			}, userid);
		});

	}	
	
	app.everyone.now.findQuickGame = function(options, callback) {
		
		// TODO: Prüfen ob der Benutzer schon in einem Raum ist
		
		var self = this;
		var tries = 0;
		
		var opponents = -1;
		var reaction = -1;
		var deck = -1;
		if (options.opponents == 1) opponents = 1;
		else if (options.opponents == 2) opponents = 2;
		else if (options.opponents == 3) opponents = 3;		
		if (options.reaction == 15) reaction = 15;
		else if (options.reaction == 30) reaction = 30;
		else if (options.reaction == 60) reaction = 60;	
		if (options.deck == "32er") deck = 32;	  
		else if (options.deck == "52er") deck = 52;	
		//console.log("DECK: " + deck);
		
		options.deck = deck;
		options.reaction = reaction;
		options.opponents = opponents;
		
		
	  // User holen
	  app.redisClient.hget("clientid", self.user.clientId, function(err, userid) {
		  app.redisClient.hget("user", userid, function(err, userjson) {
		    var user = JSON.parse(userjson);  		
		
			  var iv = setInterval(function() {			
						getRoomListByOptions(options, function(rooms) {
							tries++;
							
							// Abbruch falls bei 20 Versuchen nichts gefunden wurde					
							if (tries > 20) {
								callback(-1, null);
								removeUserFromQuickGameList(user.id, iv);
								return;
							}			
							
							if (rooms.length == 0) {
								
								// Clearen beim Trigger (Wenn man in einen Raum zugelost wurde)
								events.removeAllListeners('removeMeFromQuickList'+user.id);
								events.once('removeMeFromQuickList'+user.id, function(roomid) {
									//console.log("Trigger von außerhalb um Timer zu beenden: " + +user.id);
									
								  removeUserFromQuickGameList(user.id, iv);
								  callback(tries, { id: roomid });

								});		
								// Prüfen ob ein anderer Spieler in der Warteliste zu mir passt								
								checkQuickGameList(user.id, options, callback);
								
								
								callback(tries, null);
							}
							else {
								removeUserFromQuickGameList(user.id, iv);
								callback(tries, rooms[0]);
								return;
							}
							
								

							
		
							
						}, userid);				
		
					}, 
					7*1000
				);
				
				// In Redis-Schreiben um andere die gerade Suchen zu finden
				app.redisClient.hset("quickGame", user.id, JSON.stringify(options));
				
				// Initial einmal aufrufen, damit nicht 10 Sek gewartet wird
				iv.callback();		
						
				
				self.now.cancelSearch = function() {
					removeUserFromQuickGameList(user.id, iv);
				}
		

			});	
		});


	}		
	

	app.everyone.now.getFilteredRoomList = function(filterValue, callback) {
		if (filterValue == "") {
			this.now.giveMeTheRooms(callback);
		}
		else {
			getFilteredRoomList(filterValue, function(filteredRooms) {
				callback(filteredRooms);
			});
		}
	}	

	app.everyone.disconnected(function(){
		var self = this;
		console.log("app.everyone.disconnected");
	  // User holen
	  app.redisClient.hget("clientid", self.user.clientId, function(err, userid) {
		  app.redisClient.hget("user", userid, function(err, userjson) {
		    var user = JSON.parse(userjson);  
				if (user != null && user.clientid === self.user.clientId) {
					console.log("User disconnected: " + self.user.clientId);
	
					// Spieler aus dem Raum löschen (nur wenn er drin ist)
					leaveRoom(user, self);
					
					// TODO Spieler aus dem Spiel löschen
					
					// Spieler aus den Quick-Game-Suchen löschen
					events.emit('removeMeFromQuickList'+user.id, -1);
					
					// ClientId aus User löschen
					user.clientid = null;
					app.redisClient.hset("user", user.id, JSON.stringify(user));
					
			
				}
				else {
					console.log("Der USer ist nicht der aktuell eingeloggt - da stimmt was nicht");
				}
				
				// Client-ID->Userid zuordnung löschen
				app.redisClient.hdel("clientid", self.user.clientId);						
				



		  });
		});		

	});
	
	app.everyone.now.kickUser = function(playerId, bann) {
		var self = this;
		// User auslesen
	  app.redisClient.hget("clientid", self.user.clientId, function(err, userid) {
		  app.redisClient.hget("user", userid, function(err, userjson) {
		    var user = JSON.parse(userjson);
		    if (user != null) {
		    	// Raum auslesen
		    	app.redisClient.hget("room", user.userroom, function(err, roomjson) {
		      	var room = JSON.parse(roomjson);		
		      	if (room != null) {
		      		if (room.adminuser === userid && userIsInRoom(room, playerId)) {
		      			// zu kickenden Player auslesen
								app.redisClient.hget("user", playerId, function(err, userjson) {
									var player = JSON.parse(userjson);	      			
		      				// NowJS Socket raussucehn
			      			app.nowjs.getClient(player.clientid, function() {
			      				leaveRoom(player, this, true, bann);
			      				var roomgroup = app.nowjs.getGroup('room'+room.id);
					      				
	
	
			      				
			      			});
		      			});
		      		}
		      	}
		      });    		
		    }  
				
		
		  });
		});		

	}		
	
	app.everyone.now.toggleRoomLock = function() {
		var self = this;
		// User auslesen
	  app.redisClient.hget("clientid", self.user.clientId, function(err, userid) {
		  app.redisClient.hget("user", userid, function(err, userjson) {
		    var user = JSON.parse(userjson);
		    if (user != null) {
		    	// Raum auslesen
		    	app.redisClient.hget("room", user.userroom, function(err, roomjson) {
		      	var room = JSON.parse(roomjson);
		      	if (room != null) {
		      		if (room.adminuser === userid) {
									if (room.closed  === true) {
										room.closed = false;
							      var chatmsg = {
						      		name: "",
						      		icon: "/images/blank.png",
							      	msg: "Der Raum wurde wieder aufgeschlossen",
							      	time: new Date().getHours() + ":" + new Date().getMinutes() 		      	
							      }
							      											
									}
									else {
										room.closed = true;
										
							      var chatmsg = {
						      		name: "",
						      		icon: "/images/blank.png",
							      	msg: "Der Raum wurde abgeschlossen",
							      	time: new Date().getHours() + ":" + new Date().getMinutes() 		      	
							      }										
									}
									var roomgroup = app.nowjs.getGroup('room'+room.id);
									app.redisClient.hset("room", room.id, JSON.stringify(room));
									roomgroup.now.toggleRoomLockPush();
									
									roomgroup.now.newChatMessage(chatmsg);		
									
		      		}
		      	}
		      });    		
		    }  						
		  });
		});		

	}		
	
	app.everyone.now.changeMyUserName = function(username, successCallback) {
		var self = this;
		if (username.length > 20) {
			username = username.substr(0, 20);
		}
		// User auslesen
	  app.redisClient.hget("clientid", self.user.clientId, function(err, userid) {
		  app.redisClient.hget("user", userid, function(err, userjson) {
		    var user = JSON.parse(userjson);
		    var oldusername = user.name;
		    console.log("user.usernameChanged: " + user.usernameChanged);
		    if (user != null && user.usernameChanged === false) {
					checkUserName(username, function(usernameOk) {
						if (usernameOk && username != user.name) {
							user.name = username;
							user.usernameChanged = true;
							self.now.me.name=username;
							
							
							app.redisClient.hset("user", userid, JSON.stringify(user));
							app.redisClient.sadd("usernames", username);
						  app.redisClient.hset("userNameToId", user.name, user.id);
						  app.redisClient.hdel("userNameToId", oldusername);
							
							
							self.now.userDetailsArrived(reduceUserObject(user));
							successCallback();
							console.log("Usernamen geändert");
						}
						else {
							self.now.showErrorMessage("Den Benutzernamen gibt es schon.");	
						}
					})
		    }  						
		  });
		});		

	}		
	
	
	app.everyone.now.changeMyPassword = function(saltedPwHash, usersalt, actualPwHash, successCallback) {
		var self = this;

		// User auslesen
	  app.redisClient.hget("clientid", self.user.clientId, function(err, userid) {
		  app.redisClient.hget("user", userid, function(err, userjson) {
		    var user = JSON.parse(userjson);
		    if (user != null) {
					if(user.hasPassword === true) {
						// User hat schon ein Passwort -> Ändern
						
						var actualuserpw = hashlib.md5(actualPwHash + user.serversalt);
						// Wenn aktuelles passwort stimmt
						if (user.password === actualuserpw) {
							console.log("PW stimmt");
							var userpwneu = hashlib.md5(saltedPwHash + user.serversalt);
							user.password = userpwneu;
							app.redisClient.hset("user", user.id, JSON.stringify(user));
							successCallback();
						}
						else {
							self.now.showErrorMessage("Das eingegebene Passwort stimmt nicht.");		
						}
					}
					else {
						// User hat noch kein PW
						
						// Server-Salt setzen
						var serversalt = hashlib.md5(Math.floor(Math.random() * 10000000).toString(16));
						var userpw = hashlib.md5(saltedPwHash + serversalt);
						
						user.serversalt = serversalt;
						user.usersalt = usersalt;
						user.password = userpw;
						user.hasPassword = true;
						
						app.redisClient.hset("user", user.id, JSON.stringify(user));
						successCallback();
						
					}
		    }  						
		  });
		});		

	}
	
	app.everyone.now.startNewGame = function() {
	
		var self = this;
		// User auslesen
	  app.redisClient.hget("clientid", self.user.clientId, function(err, userid) {
		  app.redisClient.hget("user", userid, function(err, userjson) {
		    var user = JSON.parse(userjson);
		    if (user != null) {
		    	// Raum auslesen
		    	app.redisClient.hget("room", user.userroom, function(err, roomjson) {
		      	var room = JSON.parse(roomjson);
		      	if (room != null) {
							// Prüfen ob der Spieler der Fkt aufgerufen hat
							// ein neues Spiel starten darf		      		
		      		if (room.adminuser === userid && room.playerCount >=2) {
	      				app.redisClient.incr("gameIdKey", function() {
	  							app.redisClient.get("gameIdKey", function(err, gameid) {
	  								
										var game = {
											id: gameid,
											players: [],
											trayStack: [],
											pickStack: [],
											room: room.id,
											activeSevens: 0,
										}	  	
										// Spieler auslesen
										_.each(room.players, function(player, idx) {
											game.players.push({
												id: player.id,
												name: player.name,
												icon: player.icon,
												cards: [],
												cardCount: 0,
												activated:false
											});
											
											// Redis-User auslesen
											app.redisClient.hget("user", player.id, function(err, pjson) {
												// Game setzen
												var u = JSON.parse(pjson);
												u.usergame = game.id;
												app.redisClient.hset("user", player.id, JSON.stringify(u));
											});		
										});	
										
										// Deck generieren und Spielern Karten geben	
										var deck= []
										if (room.deckType === 32) {
											for (var color=0; color<=3; color++) {
												for (var value=7; value<=14; value++) {
													deck.push({
														color: color,
														value: value
													});
												}											
											}
										}
										else {
											for (var color=0; color<=3; color++) {
												for (var value=2; value<=14; value++) {
													deck.push({
														color: color,
														value: value
													});
												}											
											}											
										}
										// Deck mischen
										deck = _.shuffle(deck);
										
										// Karten an die Spieler verteilen
										_.each(game.players, function(player, idx) {		
											// 6 Karten für jeden Spieler
											// TODO: wieder auf 6 aendern	
											player.cardCount = 6;
											for (var i=0; i<player.cardCount;i++) {
												player.cards.push(deck.pop());
											}								
										});
										
										// Eine Karte auf den Stapel in der Mitte
										game.trayStack.push(deck.pop());
										
										// Rest kommt in den pickStack
										game.pickStack = deck;
										game.pickStackSize = deck.length;
										
										// Spieler der als nächstes Dran ist, setzen (Zufall)
										game.whosTurn = game.players[Math.floor(Math.random() * game.players.length)].id;
										
										// Spiel speichern
										app.redisClient.hset("game", game.id, JSON.stringify(game), function() {
											
											// Alle Spieler zur Game-Seite umleiten
											var roomgroup = app.nowjs.getGroup('room'+room.id);
											roomgroup.now.navigateUser("games/maumau/game/"+game.id);
											
											
										});
	  								
	  							});
	  						});  		

									
		      		}
		      	}
		      });    		
		    }  						
		  });
		});		

	};			
	
	app.everyone.now.getGameInfos = function(gameid, callback) {
		var self = this;
		// User auslesen
	  app.redisClient.hget("clientid", self.user.clientId, function(err, userid) {
		  app.redisClient.hget("user", userid, function(err, userjson) {
		    var user = JSON.parse(userjson);
		    if (user != null) {
					// Game auslesen
					console.log("gameid: "+ gameid);
					app.redisClient.hget("game", gameid, function(err, gamejson) {
						var game = JSON.parse(gamejson);
						// Wenn der Spieler im Raum ist
						if (game != null && userIsInGame(game, userid)) {
							var usergame = reduceGameObject(game);
							callback(usergame, getUserFromGame(game, userid));
						}
					});
		    }  						
		  });
		});		

	}	
	
	app.everyone.now.placeCard= function(card) {
		var self = this;
		// User auslesen
		console.log(1);
	  app.redisClient.hget("clientid", self.user.clientId, function(err, userid) {
		  app.redisClient.hget("user", userid, function(err, userjson) {
		    var user = JSON.parse(userjson);
		    if (user != null) {
		    	console.log(2);
					// Game auslesen
					app.redisClient.hget("game", user.usergame, function(err, gamejson) {
						var game = JSON.parse(gamejson);
						// Wenn der Spieler im Spiel ist
						if (game != null && userIsInGame(game, userid)) {
							console.log(3);
							// Wenn der Spieler an der Reihe ist und 
							// der Spieler diese Karte haelt
							if (game.whosTurn === userid && userHasCard(card, getUserFromGame(game, userid))) {
								console.log(4);
								// Prüfen ob die Karte auf den Stapel passt
								var fit = true;
								var lastTrayStackCard = game.trayStack[game.trayStack.length-1];
								if (card.color != lastTrayStackCard.color && card.value != lastTrayStackCard.value ) {
									fit = false;
								}
								
								// Wenn Bube, dann darf nicht schon ein Bube daliegen
								if (card.value === 11 && lastTrayStackCard.value === 11) {
									fit = false;
								}
								else if (card.value == 11) {
									fit = true;
								}
								
								if (game.activeSevens != 0 && card.value != 7) {
									fit=false;
								}
								
								
								if (fit) {
									console.log("Die KArte passt");
									game.trayStack.push(card);
									if (card.value === 7) {
										game.activeSevens++;
									}
									var gameplayer = getUserFromGame(game, userid);
									
									// Karte aus der Spielerhand entfernen
									for (var j in gameplayer.cards) {
										var c = gameplayer.cards[j];
										if (c.color === card.color && c.value === card.value) {
											gameplayer.cards.splice(j,1);
											gameplayer.cardCount--;
											break;
										}
									}
									
									// Setzen wer als nächstes dran ist
									setNextTurn(game);

									
									app.redisClient.hset("game", game.id, JSON.stringify(game));
									
									var roomgroup = app.nowjs.getGroup('room'+user.userroom);
									roomgroup.now.cardPlaced(card, userid, game.whosTurn);
									
									
								}
								else {
									console.log("Die Karte passt nicht");
								}
							}
							
						}
					});
		    }  						
		  });
		});		

	}	
	
	
	
	app.everyone.now.resetEmptySevens= function() {
		var self = this;
		// User auslesen
	  app.redisClient.hget("clientid", self.user.clientId, function(err, userid) {
		  app.redisClient.hget("user", userid, function(err, userjson) {
		    var user = JSON.parse(userjson);
		    if (user != null) {
					// Game auslesen
					app.redisClient.hget("game", user.usergame, function(err, gamejson) {
						var game = JSON.parse(gamejson);
						// Wenn der Spieler im Spiel ist
						if (game != null && userIsInGame(game, userid)) {
							// Wenn der Spieler an der Reihe ist und 
							if (game.whosTurn === userid) {
								
								var gameuser = getUserFromGame(game, userid);
								var roomgroup = app.nowjs.getGroup('room'+user.userroom);
								
								// Wenn der siebenen-Zaehler > 0 ist
								if (game.activeSevens > 0) {
									var cardcount = game.activeSevens * 2;
									var cards = [];
									for (var i=0; i<cardcount;i++) {
										var c = getCardFromPickStack(game, roomgroup);
										cards.push(c);
										gameuser.cards.push(c);
									}
									gameuser.cardCount += cardcount;
									
									
									
									game.activeSevens = 0;
									
									setNextTurn(game);
									
									app.redisClient.hset("game", game.id, JSON.stringify(game));
									self.now.takeSevens(cards);
									roomgroup.now.sevensTaken(cards.length, userid, game.whosTurn);								
									
									
								}
								
							}
							
						}
					});
		    }  						
		  });
		});		

	}	
	
	app.everyone.now.takeCardFromPickStack= function() {
		var self = this;
		// User auslesen
	  app.redisClient.hget("clientid", self.user.clientId, function(err, userid) {
		  app.redisClient.hget("user", userid, function(err, userjson) {
		    var user = JSON.parse(userjson);
		    if (user != null) {
					// Game auslesen
					app.redisClient.hget("game", user.usergame, function(err, gamejson) {
						var game = JSON.parse(gamejson);
						// Wenn der Spieler im Spiel ist
						if (game != null && userIsInGame(game, userid)) {
							// Wenn der Spieler an der Reihe ist und 
							if (game.whosTurn === userid) {
								
								var gameuser = getUserFromGame(game, userid);
								var roomgroup = app.nowjs.getGroup('room'+user.userroom);
								
								
								var c = getCardFromPickStack(game, roomgroup);
								gameuser.cards.push(c);	
								gameuser.cardCount++;							
								
								setNextTurn(game);
								
								app.redisClient.hset("game", game.id, JSON.stringify(game));
								self.now.pickCard(c);
								roomgroup.now.cardPicked(userid, game.whosTurn);									
								
								/*// Wenn der siebenen-Zaehler > 0 ist
								if (game.activeSevens > 0) {
									var cardcount = game.activeSevens * 2;
									var cards = [];
									for (var i=0; i<cardcount;i++) {
										var c = getCardFromPickStack(game, roomgroup);
										cards.push(c);
										gameuser.cards.push(c);
									}
									gameuser.cardCount += cardcount;
									
									
									
									game.activeSevens = 0;
									
									setNextTurn(game);
									
									app.redisClient.hset("game", game.id, JSON.stringify(game));
									self.now.takeSevens(cards);
									roomgroup.now.sevensTaken(cards.length, userid, game.whosTurn);								
									
									
								}*/
								
							}
							
						}
					});
		    }  						
		  });
		});		

	}			

}

var getCardFromPickStack = function(game, roomgroup) {
	if (game.pickStack.length > 0) {
		return game.pickStack.pop();
	}
	else {
		var tmpTrayStack = game.trayStack;
		game.trayStack = [];
		game.trayStack.push(tmpTrayStack.pop());
		tmpTrayStack = _.shuffle(tmpTrayStack);
		game.pickStack = tmpTrayStack;
		
		roomgroup.now.resetTrayStack();
		
		if (game.pickStack.length == 0) {
			// TODO: Es gibt aktuell keine Karten mehr die gezogen werden können
		}
		
		return game.pickStack.pop();
		
	}
}

var setNextTurn = function(game) {
	for (var pk in game.players) {
		var p = game.players[pk];
		if (p.id === game.whosTurn) {
			if  (parseInt(pk) === game.players.length-1) {
				game.whosTurn = game.players[0].id
				console.log("joo1");
			}
			else {
				console.log("joo2");
				console.log(parseInt(pk)+1);
				game.whosTurn = game.players[parseInt(pk)+1].id
			}
			break;
		}
	}	
}

var userHasCard = function(card, player) {
	for (i in player.cards) {
		var c = player.cards[i];
		if (c.color === card.color && c.value === card.value) {
			return true;
		}
	}
	return false;
}

var userIsInGame = function(game, userid) {
	for (i in game.players) {
		var p = game.players[i];
		if (p.id === userid) {
			return true;
		}
	}
	return false;
}

var getUserFromGame = function(game, userid) {
	for (i in game.players) {
		var p = game.players[i];
		if (p.id === userid) {
			return p;
		}
	}
	return null;
}

var checkUserName = function(username, callback) {
	app.redisClient.sismember("usernames", username, function(err, userexists) {
		if (userexists === 1) {
			callback(false);
		}
		else {
			callback(true);
		}
	});	
}

var userIsInRoom = function(room, userid) {
	for (i in room.players) {
		var p = room.players[i];
		if (p.id === userid) {
			return true;
		}
	}
	return false;
}

var leaveRoom = function(user, nowuser, kick, bann) {
	//console.log("UUUUSER");
	//console.log(user);
	if (user.userroom == null || user.userroom === undefined) {
		// Der User ist in keinem Raum			
		//console.log("Der User ist in keinem Raum")
		return;	
	}
	
	//console.log("Der user ist in einem Raum");
  app.redisClient.hget("room", user.userroom, function(err, roomjson) {
    
    var room = JSON.parse(roomjson);
    var roomgroup = app.nowjs.getGroup('room'+room.id);

  	// Raum verlassen
  	removePlayerFromRoom(room, user, function(newroom, newuser) {
		  //roomgroup.now.showRoomDetailUpdates(room);
		  if(kick === true) {
	      chatmsg = {
	    		name: "",
	    		icon: "/images/blank.png",
	      	msg: user.name + " wurde rausgeschmissen",
	      	time: new Date().getHours() + ":" + new Date().getMinutes() 		      	
	      }
	      roomgroup.now.newChatMessage(chatmsg);	
	      
	      nowuser.now.showErrorMessage("Du wurdest aus dem Raum geschmissen.");		
	      nowuser.now.removeRoom();  	
		  }
		  else {
	      
	      chatmsg = {
	    		name: "",
	    		icon: "/images/blank.png",
	      	msg: user.name + " hat den Raum verlassen",
	      	time: new Date().getHours() + ":" + new Date().getMinutes() 		      	
	      }
	      roomgroup.now.newChatMessage(chatmsg);
	      
		  }
		  
		  // Wenn der User gebannt werden soll
		  if (kick === true && bann === true) {
		  	room.bannlist.push(user.id);
		  	app.redisClient.hset("room", room.id, JSON.stringify(room));
		  }
		  
		  
		  
		  
  		nowuser.now.navigateUser("games/maumau");
  	});
    				      			      
  
    		      
  });		
};
	
	
var removePlayerFromRoom = function(room, user, callback) {
	//console.log(room);
	_.each(room.players, function(player, idx) {
		if (player.id === user.id) {
			room.players.splice(idx,1);
			room.playerCount -= 1;
			//console.log("Neuer Raum");
			//console.log(room);
			
			user.userroom = null;
			
			// Raus aus der Now-Gruppe
			var roomgroup = app.nowjs.getGroup('room'+room.id);
			roomgroup.removeUser(user.clientid);	
			
		
			
			// Wenn der User der den Raum verlässt Admin war
			if (room.adminuser === user.id && room.playerCount > 0) {
				// Neuen Admin zuweisen
				room.adminuser = room.players[0].id;
				
				// Im Chat bescheid sagen
	      chatmsg = {
	    		name: "",
	    		icon: "/images/blank.png",
	      	msg: room.players[0].name + " hat nun hier das Sagen.",
	      	time: new Date().getHours() + ":" + new Date().getMinutes() 		      	
	      }
	      roomgroup.now.newChatMessage(chatmsg);						
				
			}		
			
			// Den anderen Leuten bescheid sagen
			roomgroup.now.userLeavedRoom(player, room);			
			
			// Und User und Room speichern
			app.redisClient.hset("user", user.id, JSON.stringify(user));
			app.redisClient.hset("room", room.id, JSON.stringify(room));
			
	
			
			// Wenn der Raum jetzt leer ist, löschen
			if (room.playerCount == 0) {
				app.redisClient.hdel("room", room.id);
			}
			

			
			
			// Callback aufrufen
			callback(room, user);
			
			
			


		}
	});
}	



var removeUserFromQuickGameList = function(userid, iv) {
	clearInterval(iv);
	app.redisClient.hdel("quickGame", userid);
}


var checkQuickGameList = function(userid, useroptions, callback) {
	
	
	var suitedPlayer = [];
	
  app.redisClient.hgetall("quickGame", function (err, obj) {
    for (key in obj) {
      var options = JSON.parse(obj[key]);
			
			var mindOpponents = useroptions.opponents;
			var deckValue = useroptions.deck;
			var reactionValue = useroptions.reaction;
			
			var fit = false;
			var opponentCountFit = false;
			var deckFits = false;
			var reactionFits = false;
			
			// Nur wenn der aktuelle User nicht man selbst ist
			if (userid != key) {
				
				if (useroptions.opponents === options.opponents) {
					// Wenn beide gleich viele Spieler wollen
					opponentCountFit = true;
				} 
				
				else if (useroptions.opponents === -1) {
					// Wenn es mir egal ist wieviel Spieler
					
					// Passen zusammen
					opponentCountFit = true;
					
					// Ab jetzt suchen wir aber soviele Spieler wie der Gegner hat
					mindOpponents = options.opponents;
				} 
				else if ( options.opponents === -1) {
					// Wenn dem Gegner egal ist wieviele - Passt
					opponentCountFit = true;
				}
				
				// Deck und Reaktionszeit müssen gleich sein
				if (deckValue === options.deck || options.deck === -1) {
					deckFits = true;
				}
				// Wenn mein Deck egal ist, dann müssen alle kommenden Spieler das Deck vom aktuellen Gegner haben
				if (useroptions.deck === -1) {
					deckFits = true;
					deckValuev = options.deck;
				}
				
				
				if (reactionValue === options.reaction || options.reaction === -1) {
					reactionFits = true;
				}
				if (useroptions.reaction === -1) {
					reactionFits = true;
					reactionValue = options.deck;
				}
					
				
				
				// Wenn Spielernzahl und Deck/Reaction passen
				if (opponentCountFit && deckFits && reactionFits) {
					// Spieler passen wirklich zusammen
					//console.log("2 Spieler passen zusammen");
					suitedPlayer.push(key);
					
					// Wenn genug Spieler da sind
					if (suitedPlayer.length >= mindOpponents) {
						//console.log("Es sind genug Spieler da die zusammen passen");
						
						// Mich zu den Spielern hinzufügen
						suitedPlayer.push(userid);
						
						connectSuitedPlayers(suitedPlayer, deckValue, reactionValue);
						
						
						// Schleife abbrechen, sind ja genug da...
						break;
					}
				}
				
				
				
				

			}

   	}

  });		
}


var connectSuitedPlayers = function(players, deck, reaction) {
	// Player 0 ist Admin
	var adminid = players[0];
	// Admin auslesen
  app.redisClient.hget("user", adminid, function(err, userjson) {
    var admin = JSON.parse(userjson);
    var roomname = admin.name + "s Raum";  	
    var options = {
    	opponents: 5,
    	deck: deck,
    	reaction: reaction
    };
    
    // Admin-Socket raussuchen und für ihn einen Raum erstellen
    app.nowjs.getClient(admin.clientid, function() {
    	this.now.createRoom(roomname, options, function(roomid) {
    		
				// Alle anderen User in diesen Raum schieben
				_.each(players, function(playerid, idx) {
					//console.log("idx: " + idx);
					if (idx === 0) {
						events.emit('removeMeFromQuickList'+playerid, roomid);
						return;
					}
					// Spieler auslesen
					app.redisClient.hget("user", playerid, function(err, playerjson) {
						var player = JSON.parse(playerjson);
						// Socket auslesen
						app.nowjs.getClient(player.clientid, function() {
							//console.log("emit removeMeFromQuickList"+player.id);
							events.emit('removeMeFromQuickList'+playerid, roomid);
							this.now.navigateUser("games/maumau/room/"+roomid);
							
						});
						
					});
						
									
				});    		
    		
    	});
    })
    
  });

  
}






var getRoomListByOptions = function(options, callback, userid) {
		var opponents = -1;
		var reaction = -1;
		var deck = -1;
		//console.log("hihi:" + JSON.stringify(options));
		if (options.opponents == 1) opponents = 1;
		else if (options.opponents == 2) opponents = 2;
		else if (options.opponents == 3) opponents = 3;		
		if (options.reaction == 15) reaction = 15;
		else if (options.reaction == 30) reaction = 30;
		else if (options.reaction == 60) reaction = 60;	
		if (options.deck == "32er" || options.deck == 32) deck = 32;	  
		else if (options.deck == "52er" || options.deck == 52) deck = 52;	
		
		//console.log("Deck-Eingabe: " + deck)
		
		var rooms = generateRoomList(function(rooms) {
			var filteredRooms = _.filter(rooms, function(room){
				if (opponents != -1 && room.playerCount < opponents) {
					return false;
				}
				if (reaction != -1 && room.reactionTime != reaction) {
					return false;
				}
				if (deck != -1 && room.deckType != deck) {
					return false;
				}
				//console.log("Raum-Deck: " + room.deckType)
				// Wenn Raum voll ist
				if (room.playerCount === room.maxPlayers) {
					return false
				}
				
				// Wenn der user auf der Bann_liste steht
				if (_.indexOf(room.bannlist, userid) != -1) {
					return false;
				}
				
				// wenn der Raum abgeschlossen ist
				if (room.closed === true) {
					return false;
				}
				
				return true;					
			});			
			
			callback(filteredRooms);
		

		});		
}


var getFilteredRoomList = function(filterValue, callback) {
	generateRoomList(function(rooms) {
		var filteredRooms = _.filter(rooms, function(room) {			
					
			var roomnameMatch = room.name.toLowerCase().match(filterValue.toLowerCase());
			if (roomnameMatch != null) {
				return true;
			}
			
			// Prüfen ob einer der Spieler passt
			for (idx in room.players) {
				var player = room.players[idx];
				var playernameMatch = player.name.toLowerCase().match(filterValue.toLowerCase());
				if (playernameMatch != null) {
					return true;
				}
			}

		});
		callback(filteredRooms);
		
			
	});
}

// Raum-Liste erstellen
var generateRoomList = function(callback) {
  var rooms = [];
  app.redisClient.hgetall("room", function (err, obj) {
    for (key in obj) {
      var room = JSON.parse(obj[key]);
      /*var shortroom = {
        id: key,
        name: room.name,
		    maxPlayers: room.maxPlayers,
		    reactionTime: room.reactionTime,
		    deckType: room.deckType,        
        playercount: room.players.length
      };*/
      rooms.push(room);      
    }
    if (callback != undefined) {
    	callback(rooms);
    }
    
  });
  
};


var reduceUserObject = function(user) {
	return {
		id: user.id,
		name: user.name,
		icon: user.icon,
		userroom: user.userroom,
		usernameChanged: user.usernameChanged,
		hasPassword: user.hasPassword,
		usersalt: user.usersalt

	};

}

var reduceGameObject = function(game) {
	var newgame =  {
		id: game.id,
		whosTurn: game.whosTurn,
		trayStack: game.trayStack,
		players:[],
		room: game.room,
		activeSevens: game.activeSevens
	};
	
	_.each(game.players, function(player, idx) {
		newgame.players.push({
			id: player.id,
			name: player.name,
			icon: player.icon,
			cardCount: player.cardCount,
			activated:player.activated
		});
	});
	
	return newgame;

}




/*

// MauMau Logik

everyone.now.startNewGame = function() {

	// Prüfen ob der Spieler der Fkt aufgerufen hat
	// ein neues Spiel starten darf
	
	
	// Ein neues Game-Obj erstellen
	// In redis speichern
	
	
	// Und zu den Clients des Raumes schicken
	// indem die startNewGame auf dem Client aufgerufen wird
	
	


};

everyone.now.placeCard = function() {
	// Prüfen ob der Spieler überhaupt dran ist
	
	// Prüfen ob die Karte auf die letzte passt
	
	// Karte an die Clients schicken
};

everyone.now.takeCardFromStack = function() {
	// Prüfen ob der Spieler überhaupt dran ist
	
	// Karte an Spieler schicken
	
	// Andere Spieler informieren, dass der Spieler eine Karte gezogen hat
	
};
*/