var NewRoomView = Backbone.View.extend({
    events: {
      "click .formSwitchButtons": "onRadioClick",
      "click .formButton": "createRoom"
    },
    initialize: function() {
      _.bindAll(this, "render");
    },
    render: function() {   
      $(this.el).html(ich.newroomTmpl());        
      return this;
    },
    firstRender: function() {
      var self = this;
      this.render();
      



      $("#gameview").append(this.el);
      
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
    	
    	
    }    
});
