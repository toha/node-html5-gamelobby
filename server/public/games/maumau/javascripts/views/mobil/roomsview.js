var RoomsView = Backbone.View.extend({
    events: {
        "click .listRow": "openRoom"
    },
    initialize: function() {
      _.bindAll(this, "render");
    },
    render: function() {   

        return this;
    },
    firstRender: function() {
        var self = this;
        
        $(this.el).html(ich.roomsTmpl());  


        $("#gameview").append(this.el);

        
        return self;
    },
    openRoom: function(e) {

      app.navigate("games/maumau/room/bla", true);

    }
});
