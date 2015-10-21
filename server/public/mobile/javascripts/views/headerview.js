var HeaderView = Backbone.View.extend({
    events: {
        "click #headerBack": "goBack",
        "mousedown #headerBack": "markHeaderBack"
    },
    initialize: function() {

    },
    render: function() {   

        return this;
    },
    firstRender: function() {
        var self = this;
        
        $(this.el).html(ich.headerTmpl());
        $("body").append(this.el);
        
        return this;
    },
    goBack: function() {
      window.history.back()
    },
    markHeaderBack: function() {

      $("#headerBack").addClass("headerBackActive");

      setTimeout( function() {

        $("#headerBack").removeClass("headerBackActive");		    
	    }, 250 );

    }

});
