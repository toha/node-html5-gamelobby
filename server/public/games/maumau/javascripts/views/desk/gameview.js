var CanvasView = Backbone.View.extend({
    events: {
    },
    initialize: function() {
      _.bindAll(this, "render");
    },
    render: function() {   
      $(this.el).html(ich.gameTmpl());        
      return this;
    },
    firstRender: function() {
      var self = this;
      this.render();


      $("#gameview").append(this.el);

      
      return self;
    }
});
