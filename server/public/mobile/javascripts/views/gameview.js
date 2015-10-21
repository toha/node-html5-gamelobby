var GameView = Backbone.View.extend({
    events: {
       
    },
    initialize: function() {

    },
    render: function() {   
      $(this.el).html(ich.gameviewTmpl());
      return this;
    },
    firstRender: function() {
      var self = this;
      this.render();
      


      $("body").append(self.el);


      
      $("#gameview").css("margin-top", $("#header").innerHeight()+7);
      
      return self;
    },
    changeGameViewContent: function(newview) {
      // Alten raussliden

      // Neuen reinsliden    
    }
});
