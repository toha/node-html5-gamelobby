var RoomView = Backbone.View.extend({
    events: {
      "click .tabOverview ": "showOverviewTab",
      "click .tabPlayer ": "showPlayerTab",
      "click .tabChat ": "showChatTab" ,
      "click #roommenuLeave": "leaveRoom"
    },
    initialize: function() {
      _.bindAll(this, "render");
    },
    render: function() {   
      $(this.el).html(ich.roomTmpl());        
      return this;
    },
    firstRender: function() {
      var self = this;
      this.render();

      app.route("games/maumau/room/:roomid/player", "roomid", function(number){ 
        self.$(".tabContent").hide();
        self.$(".tabContent").eq(1).show();
        self.$(".tab").removeClass("tabActive");
        self.$(".tabPlayer").addClass("tabActive");
        self.$(".tabChat").parent().removeClass("tabActive");
  
      });

      app.route("games/maumau/room/:roomid/chat", "roomid", function(number){ 
        self.$(".tabContent").hide();
        self.$(".tabContent").eq(2).show();
        self.$(".tab").removeClass("tabActive");
        self.$(".tabChat").addClass("tabActive");
        self.$(".tabChat").parent().addClass("tabActive");

        $('html, body').animate({scrollTop: $(document).height()}, 'slow');
  
      });

    


      $("#gameview").append(this.el);
      self.$(".tabOverview").trigger("click");
      
      return self;
    },
    showOverviewTab: function(e) {
      this.$(".tabContent").hide();
      this.$(".tabContent").eq(0).show();
      this.$(".tab").removeClass("tabActive");
      this.$(".tabOverview").addClass("tabActive");
      this.$(".tabChat").parent().removeClass("tabActive");
      app.navigate("games/maumau/room/bla", true); 
      
    },
    showPlayerTab: function(e) {
      app.navigate("games/maumau/room/bla/player", true); 
      
    },
    showChatTab: function(e) {
      app.navigate("games/maumau/room/bla/chat", true); 

    },
    leaveRoom: function() {

       app.navigate("games/maumau/rooms", true);

    }
});
