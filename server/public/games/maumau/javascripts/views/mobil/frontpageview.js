var MauMauFrontpageView = Backbone.View.extend({
    events: {
       "mousedown #menu2 li": "markEntry",
       "click #menu2QuickGame": "startFastGame",
       "click #menu2Rooms": "showRooms",
       "click #menu2CreateRoom": "showNewRoom",
       /*"click .menu2QuickGame": "startFastGame",
       "click .menu2QuickGame": "startFastGame",
       "click .menu2QuickGame": "startFastGame",
       "click .menu2QuickGame": "startFastGame"*/
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
        
        var heightRoomlist = window.innerHeight-330;
        this.$("#roomlisttablediv").height(heightRoomlist);

        return self;
    },
    startFastGame: function() {
      app.navigate("games/maumau/quickgame", true);
    },
    markEntry: function() {
      self.$(".menu2QuickGame").addClass("menu2Highlight");
      self.$(".menu2QuickGame").next().addClass("menu2HighlightNext");
    },
    showRooms: function() {
      app.navigate("games/maumau/rooms", true);
    },
    showNewRoom: function() {
      app.navigate("games/maumau/newroom", true);
    }
});
