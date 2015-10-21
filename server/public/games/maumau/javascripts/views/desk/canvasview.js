var CanvasView = Backbone.View.extend({
    events: {
    },
    initialize: function() {
      _.bindAll(this, "render");
    },
    render: function() {   
      $(this.el).html(ich.gameTmpl());        
      return this;
    },
    firstRender: function(gameid) {
      var self = this;
      this.render();


      $("#gameview").append(this.el);



			var idCanvas = 'canvas_1';

			now.getGameInfos(gameid, function(game, myPlayer) {
				now.game = game;
				now.game.myPlayer = myPlayer;
				now.game.myPlayer.maxCardIdx = 0;
				// 1 Gegner
				if (game.players.length == 2) {
					var opponentPositions = [
						{
							x: 482,
							y: 20						
						}
					];
				}	
				
				// 2 Gegner
				if (game.players.length == 3) {
					var opponentPositions = [
						{
							x: 190,
							y: 50
						},
						{
							x: 772,
							y: 50						
						}
					];
				}				
							
				// 3 Gegner
				if (game.players.length == 4) {
					var opponentPositions = [
						{
							x: 40,
							y: 70
						},
						{
							x: 482,
							y: 20						
						},
						{
							x: 922,
							y: 70						
						}
					];
				}
				
				jc.start(idCanvas, 30);
				// Spieler Zeichnen
				var posid = 0;
				_.each(game.players, function(player, idx) {
					if (player.id === now.me.id) {
		        var img=new Image();
		        img.src=player.icon;
		        img.onload=function(){
			        
			        var eid = "playerImg"+player.id;
			        console.log(eid);
			        jc.image(img,40,440,60,60)
			        	.id(eid)
			        	.opacity(0)
			        	.fadeIn(1000);			        	
			        jc.text(player.name,40,440-5,60)
			        	.font('bold 1.1em arial');
			      }								
					}
					else {
		        var img=new Image();
		        img.src=player.icon;
		        
		        img.onload=function(){
			        var pos = opponentPositions[posid];
			        var eid = "playerImg"+player.id;
			        console.log(eid);
			        jc.image(img,pos.x,pos.y,60,60)
			        	.id(eid)
			        	.opacity(0)
			        	.fadeIn(1000);
			        jc.text(player.name,pos.x,pos.y-5,60)
			        	.font('bold 1.1em arial');
			        posid++;
			      }			
	
					}

		      				
				});
				
				// Zieh-Stapel zeichnen
        var img2=new Image();
        img2.src="/images/cards/back.png";
        img2.onload=function(){
	        jc.image(img2, 50,200,90,131)
	        .level(1)
	        .id("cardback");
	      }		
	      
        var img3=new Image();
        img3.src="/images/cards/back.png";
        img3.onload=function(){
	        jc.image(img3, 55,205,90,131)
	        	.level(2);
	      }		      		
	      
        var img4=new Image();
        img4.src="/images/cards/back.png";
        img4.onload=function(){
	        jc.image(img4, 60,210,90,131)
	          .level(3)
	          .mouseover(function(point){
                if (!$("#canvasdiv").hasClass("cursorPointer")) {
                	$("#canvasdiv").addClass("cursorPointer");
                }
            })
            .mouseout(function(point){
                if ($("#canvasdiv").hasClass("cursorPointer")) {
                	$("#canvasdiv").removeClass("cursorPointer");
                }
            })
            .click(function(point) {
							now.takeCardFromPickStack();            	
            });

	      }		   	      		
				
				// Meine Karten zeichnen
				
				// Horizontaler Platz für die Karten
				var cardWidth = 100
				var cardSpace = 850;
				var cardSpaceEach = Math.floor(cardSpace / myPlayer.cardCount);
				if (cardSpaceEach > cardWidth+2) {
					cardSpaceEach = cardWidth+2;
				}
				
				var i = 0;
			  _.each(myPlayer.cards, function(card, idx) {
		     self.drawCardFromMe(card, idx, function(jcel) {
		     	jcel.translateTo(150 + (idx*cardSpaceEach),400, 300); 
		     });
			  });
				
				
				// TryStack malen
				_.each(game.trayStack, function(card, idx) {
	        var stackimg=new Image();
	        stackimg.src="/images/cards/"+ card.color + "_"+card.value+".png";
	        //alert(1);
	        stackimg.onload=function(){
		        var angle = Math.floor(Math.random() * 360);
		        var horizontalScatter = Math.floor(Math.random() * 30) - 15;
		        var verticalScatter = Math.floor(Math.random() * 30) - 15;
		        jc.image(stackimg, 480,170,100,145)
		        	.level(idx)
		        	.rotate(angle,530+horizontalScatter,242+verticalScatter);
		      }						
				});
				
				setInterval(function() {
					// Gucken wer dran ist
					var eid = "#playerImg"+now.game.whosTurn;
					var pos = jc(eid).position();
					
					jc.start(idCanvas, 60);
					jc(eid).animate({width: 63, height: 63}, 500, function() {
						jc(eid).animate({width: 57, height: 57}, 500, function() {
							
						});						
					});
				}, 1200);
				
				
			
			

			});

      
      
      now.cardPlaced = function(card, user, whosTurn) {
      	self.cardPlaced(self, idCanvas, card, user, whosTurn);
      }
      
      now.takeSevens = function(cards) {
      	self.takeSevens(self, idCanvas, cards);
      }
      
      now.sevensTaken = function(cardCount, user, whosTurn) {
      	self.sevensTaken(self, idCanvas, cardCount, user, whosTurn);
      }
      
      
      now.pickCard = function(card) {
    		var p = self.getUserFromGame(now.game, now.me.id);
  			now.game.myPlayer.cards.push(card);
  			
  			now.game.myPlayer.cardCount++;
  			p.cardCount++;
  			self.drawCardFromMe(card, now.game.myPlayer.maxCardIdx+1, function(jcel) {
  				self.reArrangeMyCards(self, now.game.myPlayer);
  			}) 
      }
      
      now.cardPicked = function(userid, whosTurn) {
    		now.game.whosTurn = whosTurn;
      }

	      
      
      now.resetTrayStack = function() {
      	alert(JSON.stringify(jc(".centerCard").attr("rotate")));
      }
      
      return self;
    },
    drawCardFromMe: function(card, idx, cardLoadedCallback) {
    	
			// Horizontaler Platz für die Karten
			var cardWidth = 100
			var cardSpace = 850;
			var cardSpaceEach = Math.floor(cardSpace / now.game.myPlayer.cardCount);
			if (cardSpaceEach > cardWidth+2) {
				cardSpaceEach = cardWidth+2;
			}    	
    	
    	if (idx > now.game.myPlayer.maxCardIdx) {
    		now.game.myPlayer.maxCardIdx  = idx;
    	}
    	
			var imgMyCard=new Image();
	        imgMyCard.src="/images/cards/"+card.color + "_" + card.value + ".png";
	        imgMyCard.onload=function(){
	        	var iid = "myCard_"+card.color+"_"+card.value;
		        jc.image(imgMyCard, 500,750,cardWidth,145)
		        	.id(iid)
		          .level(idx)
		          .click(function(point){
                // Wenn ich dran bin
                if (now.me.id === now.game.whosTurn) {
                	
	                var b = this._img.src.split("/").pop().replace(".png", "").split("_");
	                var c = {
	                	color: parseInt(b[0]),
	                	value: parseInt(b[1])
	                }
	                
	                now.placeCard(card);
	                if (value == 11) {
	                	// Farb-Auswahl-Buttons malen
	                }
	                else {
		                
	                }
                }
           		})
		          .mouseover(function(point){
	                if (!$("#canvasdiv").hasClass("cursorPointer")) {
	                	$("#canvasdiv").addClass("cursorPointer");
	                }
	            })
	            .mouseout(function(point){
	                if ($("#canvasdiv").hasClass("cursorPointer")) {
	                	$("#canvasdiv").removeClass("cursorPointer");
	                }
	            })
	          
	          cardLoadedCallback(jc("#"+iid));     		
           		
          };   	
    	
    },
    reArrangeMyCards: function(self, me) {
    	
			var cardWidth = 100
			var cardSpace = 850;
			var cardSpaceEach = Math.floor(cardSpace / me.cardCount);
			if (cardSpaceEach > cardWidth+2) {
				cardSpaceEach = cardWidth+2;
			}    	
    	
    	for (var i=0; i<me.cards.length; i++) {
    		var card = me.cards[i];
    		var iid = "#myCard_"+card.color+"_"+card.value;
    		
				jc(iid).translateTo(150 + (i*cardSpaceEach),400, 300);    		
    		
    	}
    },
    
    takeSevens: function(self, idCanvas, cards) {
    		var p = self.getUserFromGame(now.game, now.me.id);
    		_.each(cards, function(card, idx) {
    			now.game.myPlayer.cards.push(card);
    			
    			now.game.myPlayer.cardCount++;
    			p.cardCount++;
    			self.drawCardFromMe(card, now.game.myPlayer.maxCardIdx+1, function(jcel) {
    				self.reArrangeMyCards(self, now.game.myPlayer);
    			}) 
    		});
    		
    		
    		
    		jc("#takeCardsBtnGradientRect").del();
    		jc("#takeCardsBtnBorder").del();
    		jc("#takeCardsBtnTxt").del();
    		   				
   				

      	
    },
    
    sevensTaken: function(self, idCanvas, cardCount, user, whosTurn) {
    	if (user != now.me.id) {
      	var p = self.getUserFromGame(now.game, user);
      	p.cardCount += cardCount;   		
    	}
    	
    	now.game.activeSevens = 0;
    	now.game.whosTurn = whosTurn;

    },    
    
    cardPlaced: function(self, idCanvas, card, user, whosTurn) {
  		
			jc.start(idCanvas, 30);  		
  		
  		jc("#takeCardsBtnGradientRect").del();
  		jc("#takeCardsBtnBorder").del();
  		jc("#takeCardsBtnTxt").del();  		
  		
      var angle = Math.floor(Math.random() * 180) -90;
    	now.game.trayStack.push(card);
    	now.game.whosTurn = whosTurn;
    	
      var horizontalScatter = Math.floor(Math.random() * 20) - 10;
      var verticalScatter = Math.floor(Math.random() * 20) - 10;    	
    	
    	// Wenn Ich der User bin
    	if (user === now.me.id) {
    		var iid = "#myCard_"+card.color+"_"+card.value;
    		var idnew = "card_"+card.color+"_"+card.value;
    		jc(iid)
    			
    			.translateTo(480+horizontalScatter,170+verticalScatter,200, function() {
    				jc(iid).rotate(angle,'center',{x:0,y:0},50)
    							 .level(now.game.trayStack.length+1)
    							 .id(idnew)
    							 .name("centerCard")
    			});
    			
    		// Karte rauslöschen aus mir
    		for (var i=0; i<now.game.myPlayer.cards.length; i++) {
    			var c = now.game.myPlayer.cards[i];
    			if (card.color === c.color && card.value === c.value) {
    				now.game.myPlayer.cards.splice(i,1);
    				break;
    			}
    		}
    		now.game.myPlayer.cardCount--;
    		var p = self.getUserFromGame(now.game, user);
    		p.cardCount--;
    			
    		// Meine KArten neu anordnen
    		self.reArrangeMyCards(self, now.game.myPlayer);
    		
    	}
    	else {
    		var iid = "card_"+card.color+"_"+card.value;
        var imgcardnew=new Image();
        imgcardnew.src="/images/cards/"+card.color + "_" + card.value + ".png";
        imgcardnew.onload=function(){
        	// userposition auslesen
        	var userpos = jc("#playerImg"+user).position();
	        jc.image(imgcardnew, userpos.x,userpos.y+70,20,29)
	        	.id(iid)
	        	.name("centerCard")
	        	.level(now.game.trayStack.length+1)
	        	.animate({
	        		width: 100,
	        		height: 145
	        	}, 200)
	    			.translateTo(480+horizontalScatter,170+verticalScatter,200, function() {
	    				jc("#"+iid).rotate(angle,'center',{x:0,y:0},50);
	    			})
	      }	    		
    		
    	}
    	
 	
    	
    	// Wenn die Karte eine sieben ist, siebenencount nach oben
    	if(card.value === 7){
    		now.game.activeSevens++;
    	}
    	
    	// TODO: Karte aus User loeschen bzw Counter runter (oben im if-else)
    	
    	
    	// Wenn ich nun nach dieser Karte dran bin
    	if (now.game.whosTurn === now.me.id) {
    		// Wenn der siebenencount ungleich 0 ist, button anzeigen ob ich 2 ziehen will
    		if (now.game.activeSevens != 0) {
    			var txt =(now.game.activeSevens*2) + " Ziehen";

   				
	        var colors=[[0,'#ffffff'],
	                    [1,'#cccccc']];
	        var colors2=[[0,'#cccccc'],
	                    [1,'#ffffff']];                    
	        var gradient=jc.lGradient(400,345,400,390,colors);
	        var gradient2=jc.lGradient(400,345,400,390,colors2);
	        jc.rect(400,345,200,40,gradient,1)
	        	.id("takeCardsBtnGradientRect")		
	        jc.rect(400,345,200,40,"#cccccc",0)
	        	.id("takeCardsBtnBorder")
	          .mouseover(function(point){
            	jc("#takeCardsBtnBorder").color("#aaaaaa");
              jc("#takeCardsBtnTxt").color("#1C3F3F");
               
              if (!$("#canvasdiv").hasClass("cursorPointer")) {
              	$("#canvasdiv").addClass("cursorPointer");
              }               
               
            })
            .mouseout(function(point){
              jc("#takeCardsBtnBorder").color("#cccccc");  
              jc("#takeCardsBtnTxt").color("#337575");
               
              if ($("#canvasdiv").hasClass("cursorPointer")) {
              	$("#canvasdiv").removeClass("cursorPointer");
              }               
               
            })
            .click(function(point) {
            	jc("#takeCardsBtnGradientRect").color(gradient2);
            	now.resetEmptySevens();
            }) 	        	
	        jc.text(txt,500,370,60)
	        	.font('bold 1.1em arial')
	        	.align('center')
	        	.color("#337575")
	        	.id("takeCardsBtnTxt") 	   				
    			
    		}
    		
    	}
    },

    getUserFromGame: function(game, userid) {
			for (i in game.players) {
				var p = game.players[i];
				if (p.id === userid) {
					return p;
				}
			}
			return null;
		}
    
});
