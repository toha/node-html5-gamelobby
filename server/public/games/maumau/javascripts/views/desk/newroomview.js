var NewRoomView = Backbone.View.extend({
    events: {
      "click .formSwitchButtons": "onRadioClick",
      "click .formButton": "createRoom"
    },
    initialize: function() {
    },
    render: function() {   
             
      return this;
    },
    firstRender: function() {
      var self = this;
      $(this.el).html(ich.newroomTmpl()); 
			this.$(".roomNameValue").val( now.me.name + "s Raum");	
      
      
      /*self.$(".formSwitchButtons").click(function() {
        $(this).addClass("formValueSwitchButtonsActive");
      })*/

      
      var linkoffset = $("#createRoomLnk").offset();
      this.$("#newroomview").css("left", linkoffset.left-75);
      this.$("#newroomview").css("top", linkoffset.top+40);
      


      $("body").append(this.el);
      
      



      $("#createRoomLnk").click(function() {
        
        if ($("#createRoomLnk").hasClass("menuliActive")) {
        	$("#createRoomLnk").removeClass("menuliActive");
        	self.hide();
        }
        else {
        	$("#createRoomLnk").addClass("menuliActive");
        	self.show();
        	
        	if ($("#quickMatchLnk").hasClass("menuliActive")) {
        		$("#quickMatchLnk").click();
        	}        	
        }        
      });
      
      return self;
    },
    onRadioClick: function(e) {
      $(".formValueSwitchButtonsActive", this.$(e.target).parent()).removeClass("formValueSwitchButtonsActive");
      this.$(e.target).addClass("formValueSwitchButtonsActive");
    },
    createRoom: function(e) {
    	// Einstellungen auslesen
    	var roomname = this.$(".roomNameValue").val();
    	
    	var opponents = $(".formValueSwitchButtonsActive", ".opponentcount").text();
    	var reaction = $(".formValueSwitchButtonsActive", ".reactiontime").text();
    	var deck = $(".formValueSwitchButtonsActive", ".decktype").text();
    	
    	var options = {
    		opponents: opponents,
    		reaction: reaction,
    		deck: deck
    	};
    	
    	now.createRoom(roomname, options);
    	
    	// Popup verstecken
    	$("#createRoomLnk").click();
    	
    },
    show: function() {
    	$("#newroomview").show();
    },
    hide: function() {
    	$("#newroomview").hide();
    }
});
