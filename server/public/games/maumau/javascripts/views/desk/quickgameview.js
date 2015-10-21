var MauMauQuickGameView = Backbone.View.extend({
    events: {
      "click .formSwitchButtons": "onRadioClick",
      "click .formButton": "quickGame",
      "click .quickGameViewCancel": "cancelSearch"
    },
    initialize: function() {
      _.bindAll(this, "render");
    },
    render: function() {   
      $(this.el).html(ich.quickgameViewTmpl());        
      return this;
    },
    firstRender: function() {
      var self = this;
      this.render();
      
      /*self.$(".formSwitchButtons").click(function() {
        $(this).addClass("formValueSwitchButtonsActive");
      })*/

      
      var linkoffset = $("#quickMatchLnk").offset();
      
      this.$("#quickgameView").css("left", linkoffset.left-75);
      this.$("#quickgameView").css("top", linkoffset.top+40);

      

      $("body").append(this.el);


      $("#quickMatchLnk").click(function() {
        
        
        if ($("#quickMatchLnk").hasClass("menuliActive")) {
        	$("#quickMatchLnk").removeClass("menuliActive");
        	self.hide();
        }
        else {
        	$("#quickMatchLnk").addClass("menuliActive");
        	self.show(self);
        	
        	if ($("#createRoomLnk").hasClass("menuliActive")) {
        		$("#createRoomLnk").click();
        	}
        }
        
      });
      
      return self;
    },
    onRadioClick: function(e) {
      $(".formValueSwitchButtonsActive", this.$(e.target).parent()).removeClass("formValueSwitchButtonsActive");
      this.$(e.target).addClass("formValueSwitchButtonsActive");
      this.updateQuickGameCount(this);
    },
    quickGame: function(e) {
    	var self = this;
    	
    	var options = self.readQuickGameOptions();
    	$("#quickGameViewResult").show();
    	$("#quickGameViewOptions").hide();
			now.findQuickGame(options, function(tries, room) {
				
				if (tries == -1) {
					// Abbruch, nach x versuchen nichts gefunden
					$("p", "#quickGameViewResult").eq(1).html("Leider kein Spiel gefunden. Bitte später wieder probieren");
				}				
				else if (room == null) {
					// Noch kein Spiel gefunden
					$("span", "#quickGameViewResult").text(tries);
				}
				else if (room == -1) {
		    	$("#quickGameViewResult").hide();
		    	$("#quickGameViewOptions").show();		
				}				
				else {
					// Spiel gefunden
	    	$("#quickGameViewResult").hide();
	    	$("#quickGameViewOptions").show();					
					app.navigate("games/maumau/room/"+room.id, true);
				}

			});
    },
    updateQuickGameCount: function(self) {
    	var options = self.readQuickGameOptions();

    	now.getQuickGameResult(options, function(roomcount) {
    		if (roomcount == 0) {
    			self.$("#quickgameGameCount").html("Es wurde <strong>kein</strong> Raum gefunden.")
    		}
    		if (roomcount == 1) {
    			self.$("#quickgameGameCount").html("Es wurde <strong>1</strong> Raum gefunden.")
    		}    		
    		else {
    			self.$("#quickgameGameCount").html("Es wurden <strong>"+roomcount+"</strong> Räume gefunden.");
    		}
    	});
    },
    show: function(self) {
    	$("#quickgameView").show();
    	
    	self.updateQuickGameCount(self);
    	
    },
    hide: function() {
    	$("#quickgameView").hide();
    },
    readQuickGameOptions: function() {
    	var opponents = $(".formValueSwitchButtonsActive", ".quickopponentcount").text();
    	var reaction = $(".formValueSwitchButtonsActive", ".quickreactiontime").text();
    	var deck = $(".formValueSwitchButtonsActive", ".quickdecktype").text();
    	
    	var options = {
    		opponents: opponents,
    		reaction: reaction,
    		deck: deck
    	};   
    	
    	return options;    	
    },
    cancelSearch: function(){
    	$("#quickGameViewResult").hide();
    	$("#quickGameViewOptions").show();	    	
    	now.cancelSearch();
    }
});
