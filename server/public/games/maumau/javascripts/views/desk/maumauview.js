var MauMauView = Backbone.View.extend({
    events: {

    },
    initialize: function() {
      _.bindAll(this, "render");
    },
    render: function() {   

        return this;
    },
    firstRender: function() {
        var self = this;
        
        self.el = ich.maumauView();
        $("#gameview").append(self.el);


        $("#frontPageLnk", self.el).click(function() {
      		
          self.navigate(self, this, "games/maumau");
        });


				now.showErrorMessage = function(msg) {
					$("#errorMsgIcon", "#errorMsg").after(msg);
					//$("#errorMsg").text(msg);
					$("#errorMsg").removeClass("errorMsgSlideOut");

					
					if ($("#headerUserViewExtended").css("display") === 'block') {
						var t = $("#headerUserViewExtended").height() + $("#header").height() + 10;
						var t2 = t-$("#errorMsg").height()-20;
						$("#errorMsg").css("top", t2);
						$("#errorMsg").animate({
							"top": t
						}, 
						500, 
						function() {
							setTimeout(function() {
								
								$("#errorMsg").animate({
									"top": t2
								}, 
								500, 
								function() {
									$("#errorMsg").css("top", $("#errorMsg").height() * -1);									
								});								
								
							}, 4000);									
						});
					}
					else {
						
						$("#errorMsg").addClass("errorMsgSlideIn");						
						
						setTimeout(function() {
							$("#errorMsg").removeClass("errorMsgSlideIn");
							$("#errorMsg").addClass("errorMsgSlideOut");

						}, 4000);						
					}
				};

				now.navigateUser = function(url) {
					app.navigate(url, true);
				};
				
				now.showOtherTabWarning = function() {
					$("#pageOverlayOne").hide();
					$("#pageOverlayTwo").show();
				};				
    
        
        return self;
    },
    navigate: function(view, element, url) {
      
      app.navigate(url, true);

      //$("span", "#headerGameTitle").removeClass("headerGameTitleActive");
      //$("#menu").toggle();
      //$(element).removeClass("menuliActive");
    }
});
