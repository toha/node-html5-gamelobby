var RoomView = Backbone.View.extend({
    events: {
      "click #roommenuLeave": "leaveRoom",
      "click #roommenuClose": "closeToggle",
      "keypress .chatTextinput": "postChatMessage",
      //"click .chatTextBtn": "postChatMessage",
      "click .roomPlayerLnk": "onKickPlayer",
      "click #menu2StartGame": "onStartGame"
    },
    initialize: function() {
      _.bindAll(this, "render");
    },
    render: function() {   
      return this;
    },
    firstRender: function(roomid) {
      var self = this;
      


			$(self.el).html(ich.roomTmpl('<div class="loadImg"><img src="/images/load.gif" alt="load" /></div>')); 
			
			
			$("#gameview").append(self.el);	

			


      //
			now.showRoomDetails = function(room) {

				$(".loadImg").remove();
				$(self.el).html(ich.roomTmpl(room)); 
				
				
				$(".tabContent", ".tabOverview").prepend(ich.roomOverviewTmpl(room));
				
				_.each(room.players, function(player, idx) {
					var div = ich.roomPlayerTmpl(player);
					$(".listCtrl", ".tabPlayer").append(div);	

				});		
				
				$(".headerRoomName").text(room.name);		
				$(".headerRoomId").text(room.id);		
				$("#headerRoom").show();		
				self.$(".chatTextinput").focus();
				
				// Höhe justieren
				var gameviewHeight = $(".gameview").height();

				$(".tabContent", ".tabPlayer").height(gameviewHeight-140);
				$(".listCtrlSmall", ".tabChat").height(gameviewHeight-200);
				
				$(".listRowTitle").css("font-weight", "normal");
				$(".listRowTitle", "#roomPlayersPlayer" + room.adminuser).css("font-weight", "bold");
				
				/*$("#menu2StartGame").css("opacity", 0);
				$("#menu2InviteFriends").css("opacity", 0);
				$("#roommenuClose").css("opacity", 0);*/
								
				self.updateRoomMenu(room);
				
				

			};
			
			now.showRoomDetailUpdates = function(room) {
				alert("NOCH GEBRAUCHT?");
				$("#roomOverViewRoomDetails").remove();
				$(".listRow", ".tabPlayer").remove();
				
				$(".tabContent", ".tabOverview").prepend(ich.roomOverviewTmpl(room));
				
				_.each(room.players, function(player, idx) {
					var div = ich.roomPlayerTmpl(player);
					
					
					// Wenn User Admin ist
					if (room.adminuser == player.id) {
						$(".listRowTitle", div).css("font-weight", "bold");
					}
					
						
					
					$(".listCtrl", ".tabPlayer").append(div);
					
					
					self.updateRoomMenu(room);
										
				});					
			}
			now.userJoinedRoom = function(player, room) {
					var div = ich.roomPlayerTmpl(player);			
					$(".listCtrl", ".tabPlayer").append(div);						
					
					
					var playerCount = new Number($("strong:first-child", "#roomOverViewPlayerCount").text());
					playerCount += 1;
					$("strong:first-child", "#roomOverViewPlayerCount").text(playerCount);	
					
					//$(div).css("opacity", 0.5);
					
					$("#roomPlayersPlayer" + player.id).removeClass("menu2SlideOut");	
					$("#roomPlayersPlayer" + player.id).addClass("menu2SlideIn");	
					
					$(".listRowTitle").css("font-weight", "normal");
					$(".listRowTitle", "#roomPlayersPlayer" + room.adminuser).css("font-weight", "bold");
					
					// Wenn User Admin und der aktuelle Spieler kein Admin ist
					if (room.adminuser == now.me.id && room.adminuser != player.id) {
						$(".listRowColumn2", div).html(ich.roomPlayerAdminOptionsTmpl());
						
					}					
					
					self.updateRoomMenu(room);
			}
			
			now.userLeavedRoom = function(player, room) {
					
					$("#roomPlayersPlayer" + player.id).removeClass("menu2SlideIn");
					$("#roomPlayersPlayer" + player.id).addClass("menu2SlideOut");

					
					var playerCount = new Number($("strong:first-child", "#roomOverViewPlayerCount").text());
					playerCount -= 1;
					$("strong:first-child", "#roomOverViewPlayerCount").text(playerCount);	
					
					setTimeout(function() {
						$("#roomPlayersPlayer" + player.id).remove();	
					},300);
					
					$(".listRowTitle").css("font-weight", "normal");
					$(".listRowTitle", "#roomPlayersPlayer" + room.adminuser).css("font-weight", "bold");
					
					_.each(room.players, function(p, idx) {
						// Wenn User Admin und der aktuelle Spieler kein Admin ist
						if (room.adminuser == now.me.id && room.adminuser != p.id) {
							$(".listRowColumn2", "#roomPlayersPlayer" + p.id).html(ich.roomPlayerAdminOptionsTmpl());
							
						}					
					});							
					
				
					
					self.updateRoomMenu(room);											
			}			
			
			
			now.newChatMessage = function(chatMsg) {
				$(".listCtrlSmall", ".tabChat").append(ich.roomChatMessageTmpl(chatMsg));	
				$(".listCtrlSmall", ".tabChat").scrollTop($(".listCtrlSmall", ".tabChat")[0].scrollHeight);
				//$(".listCtrlSmall", ".tabChat").animate({scrollTop: $(".listCtrlSmall", ".tabChat")[0].scrollHeight}, 'fast');
			
				// Wenn die Raumansicht gerade nicht offen ist
				if ($(self.el).css("display") == "none") {
					// Raum-ICon durch sprechblase austauschen					
					if (self.chatIconInterval != undefined) {
						clearInterval(self.chatIconInterval);
					}
					self.chatIconInterval = setInterval(function() {
						$("img", "#headerRoom").toggle();
					}, 1000);
					
				}
			
			};	
			
			now.removeRoom = function() {
				$("#headerRoom").hide();	
				roomview.remove();
				roomview = null;				
			}	
			
			now.toggleRoomLockPush = function() {
	    	if ($("p:first-child", "#roommenuClose").hasClass("menu2SlideOutVertical")) {
	    		$("p:first-child", "#roommenuClose").removeClass("menu2SlideOutVertical");
	    		$("p:first-child", "#roommenuClose").addClass("menu2SlideInVertical");
	    		$("span:last-child", "#roomOverViewLock").hide();
	    		$("span:first-child", "#roomOverViewLock").show();    		
	    	}
	    	else {
	    		$("span:last-child", "#roomOverViewLock").show();
	    		$("span:first-child", "#roomOverViewLock").hide();
	    		$("p:first-child", "#roommenuClose").removeClass("menu2SlideInVertical");
	    		$("p:first-child", "#roommenuClose").addClass("menu2SlideOutVertical");
	    	}		
			}						
			
			

      now.joinRoom(roomid);
      return self;
    },

    leaveRoom: function() {
			now.leaveRoom();
			$("#headerRoom").hide();	
			roomview.remove();
			roomview = null;
       
    },
    updateRoomMenu: function(room) {
    	// Wenn der Raum nicht voll ist

    	if (room.playerCount != room.maxPlayers) {
    		$("#menu2InviteFriends").removeClass("menu2SlideOut");
    		$("#menu2InviteFriends").addClass("menu2SlideIn");
    		//$("#menu2InviteFriends").css("opacity", 1);
    		
    	}
    	else {
    		$("#menu2InviteFriends").removeClass("menu2SlideIn");
    		$("#menu2InviteFriends").addClass("menu2SlideOut");
    	}
    	
    	
    	if (room.playerCount > 1  && room.adminuser === now.me.id ) {
    		$("#menu2StartGame").removeClass("menu2SlideOut");
    		$("#menu2StartGame").addClass("menu2SlideIn");
    		//$("#menu2StartGame").css("opacity", 1);
    		
    	}
    	else {
    		$("#menu2StartGame").removeClass("menu2SlideIn");
    		$("#menu2StartGame").addClass("menu2SlideOut");  

    	}    	
    	
    	
    	if (room.adminuser === now.me.id ) {
    		$("#roommenuClose").removeClass("menu2SlideOut");
    		$("#roommenuClose").addClass("menu2SlideIn");
    		$("#roommenuClose").show();
    		
    	}
    	else {
    		$("#roommenuClose").removeClass("menu2SlideIn");
    		$("#roommenuClose").addClass("menu2SlideOut");  
    		$("#roommenuClose").hide();

    	}   
    	
    	
    	
    	//$("#roommenuLeave").addClass("menu2SlideIn");
    	
    	/*$("#menu2InviteFriends").animate({
    		"margin-left": 0
    	}, 500);*/
    },
    
    postChatMessage: function(e) {
			if (e.keyCode === undefined || e.type === "click") {
				//$(".chatTextBtn").addClass("chatTextBtnActive");
				/*setTimeout(function() {
					$(".chatTextBtn").removeClass("chatTextBtnActive");
				}, 250);*/
			}
			
    	if (e.keyCode === 13 || e.keyCode === 9 || e.keyCode === undefined || e.type === "click") {
				var msg = this.$(".chatTextinput").val();
				if (msg != "") {
					
					now.postChatMessage(msg);
					this.$(".chatTextinput").val("");
					this.$(".chatTextinput").focus();
				}
			}
			
			
			
    },
    hideRoomView: function() {
    	$(this.el).hide();
    },
    showRoomView: function() {
    	$(this.el).show();
    	
    	if (this.chatIconInterval != undefined) {
    		clearInterval(this.chatIconInterval);
    		$("img", "#headerRoom").eq(0).hide();
    		$("img", "#headerRoom").eq(1).show();
    	}
    	$(".listCtrlSmall", ".tabChat").scrollTop($(".listCtrlSmall", ".tabChat")[0].scrollHeight);
    },
    onKickPlayer: function(e) {
    	if ($(".roomPlayerLnk", $(e.currentTarget).parent().parent()).hasClass("roomPlayerLnkActive")) {
    		$(".roomPlayerLnk", $(e.currentTarget).parent().parent()).removeClass("roomPlayerLnkActive");
    		$(".roomPlayerKickConfirm").remove();
    	}
    	else {
    		var kickuserid = $(".roomPlayerHiddenId", $(e.currentTarget).parent().parent()).val();
    		var offset = $(".roomPlayerLnk", $(e.currentTarget).parent().parent()).offset();
    		$(".roomPlayerLnk", $(e.currentTarget).parent().parent()).addClass("roomPlayerLnkActive");
    		
    		var d = ich.roomPlayerKickConfirmTmpl();
    		
    		$(d).css("top", offset.top+42);
    		$(d).css("left", offset.left-65);
    		$("body").append(d);
    		
    		$(".roomPlayerKickConfirmFormBtn").click(function() {
    			
    			if ($("input", ".roomPlayerKickConfirmInput").attr('checked')) {
    				now.kickUser(kickuserid, true);
    			}
    			else {
    				now.kickUser(kickuserid, false);
    			}
    			
    			$(".roomPlayerLnk", $(e.currentTarget).parent().parent()).click();
    			
    		});
    	}
    	//
    	//
   
    },
    closeToggle: function(e) {
			now.toggleRoomLock();
    	
    },
    onStartGame: function(e) {
    	now.startNewGame();
    }
});
