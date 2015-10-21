var MauMauFrontpageView = Backbone.View.extend({
    events: {
    	"click .listRow": "onRoomClick",
    	"click .formTextinputSearch": "onSearchClick",
    	"blur .formTextinputSearch": "onSearchLeave",
    	"keyup .formTextinputSearch": "onKeyInSearch"
    },
    
    initialize: function() {
      _.bindAll(this, "render");
    },
    render: function() {        
        $(this.el).html(ich.maumauFrontpageTmpl());        
        return this;
    },
    firstRender: function() {
      var self = this;
      this.render();
      
      $("#gameview").append(this.el);
        
			// Raumliste anfordern
			self.getRoomsFromServer();

		

		

		// Höhe adjusten
		var gameviewHeight = $(".gameview").height();
		this.$("#frontpageRoomlist").height(gameviewHeight - 100);
		
		//var a = prompt("Raumname");
		//now.createRoom(a);


        return self;
    },
    getRoomsFromServer: function() {
    	var self = this;
			now.giveMeTheRooms(function(rooms) {
				self.showRoomlist(self, rooms);		
			});    	
    },

    showRoomlist: function(view, rooms) {
    	$(".listRow:gt(0)", $(".listCtrl", "#frontpageView")).remove();
    	_.each(rooms, function(room, idx) {
    		var div = ich.roomListRowTmpl(room);
    		$(".listCtrl", "#frontpageView").append(div);
    	});
    },
    onRoomClick: function(e) {
    	var roomid = $(".listRowId", e.currentTarget).text();
    	if (roomid != "") {
    		app.navigate("games/maumau/room/"+roomid, true);
    	}
    
    },
    onSearchClick: function(e) {
    	var stdvalue = this.$(".formTextinputSearch").attr("title");
    	var value = this.$(".formTextinputSearch").val();
    	if (value == stdvalue) {
    		this.$(".formTextinputSearch").val("");
    		this.$(".formTextinputSearch").addClass("formTextinputSearchActive");
    	}
			    	
    },
    onSearchLeave: function(e) {    
    	var value = this.$(".formTextinputSearch").val();
    	if (value == "") {
    		var stdvalue = this.$(".formTextinputSearch").attr("title");
    		this.$(".formTextinputSearch").val(stdvalue);
    		this.$(".formTextinputSearch").removeClass("formTextinputSearchActive");
    	}
    },
    onKeyInSearch: function(e) {
    	var self = this;
    	var value = self.$(".formTextinputSearch").val()
    	var stdvalue = this.$(".formTextinputSearch").attr("title");
    	if (value != "" && value != stdvalue) {
    		now.getFilteredRoomList(value, function(filteredRooms) {
    			self.showRoomlist(self, filteredRooms);
    		});
    	}
    	else {
    		self.getRoomsFromServer();
    	}
    }
    
});
