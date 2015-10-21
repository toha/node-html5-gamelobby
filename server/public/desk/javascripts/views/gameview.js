var GameView = Backbone.View.extend({
    events: {
    },
    initialize: function() {

    },
    render: function() {   

        return this;
    },
    firstRender: function() {
        var self = this;
        
        this.el = ich.gameviewTmpl();
        $(this.el).addClass("gameview");
        $("body").append(this.el);
        
				$(window).resize(function () { 
					self.readjustSize();
				});
				
				
        self.readjustSize();
        

        
        
        return this;
    },
    readjustSize: function() {
      // Breite des Game-Views anhand der Fensterbreite setzen
      var browserWidth = $(window).width();
      var browserHeight = $(window).height();
      var gameWidth = 900
      if (browserWidth > 900 && browserWidth <= 1280) {
      	gameWidth = browserWidth - 30;        	
      }
      else if(browserWidth > 1280) {
      	gameWidth = 1280;
      }
      
      $(".gameview").width(gameWidth);
      $(".gameview").height(browserHeight-65);	    	
    }
});
