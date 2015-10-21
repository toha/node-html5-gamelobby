var HeaderView = Backbone.View.extend({
    events: {
    },
    initialize: function() {

    },
    render: function() {   

        return this;
    },
    firstRender: function() {
        var self = this;
                       
        this.el = ich.headerTmpl();
        $("body").append(this.el);
        $("body").append(ich.topAdTmpl());

				//user details anzeigen
								
				
				$("#headerRoom").click(function(e) {
					$(e.currentTarget).addClass("headerPeopleActive");
					setTimeout(function() {
						$(e.currentTarget).removeClass("headerPeopleActive");
					}, 500);
					
					app.navigate("games/maumau/room/"+$(".headerRoomId").text(),true)
					
				});				
				
				$("#headerPeople").click(function(e) {
					if ($(e.currentTarget).hasClass("headerPeopleActive")) {
						$(e.currentTarget).removeClass("headerPeopleActive");
						$("#headerUserViewExtended").hide();
					}
					else {
						$(e.currentTarget).addClass("headerPeopleActive");
						$("#headerUserViewExtended").show();	
					
						
					}
				});
				

				
				
				
		
				self.headerSound(self);
				self.headerChangeUserName(self);
				self.headerSetPw(self);
				self.headerChangePw(self);
				self.headerLogout(self);
				self.headerChangeAcc(self);		
				self.headerChangeAvatar(self);				
				
					
				

				
				now.userDetailsArrived = function(user) {
					$("img", "#headerPeople")[0].src = user.icon;
					$("img", "#headerUserOptionsLeftPhoto")[0].src = user.icon;
					
					$(".headerUserName").text(user.name);
					
					$("h3", "#headerUserOptionsLeft").text(user.name);				

					//$("img", "#headerUserOptionsLeftPhoto").src = user.icon;

					self.showHeaderUserOverview(user);
					
					

				};
        return this;
    },
    showHeaderUserOverview: function(u) {
			$(".headerUserMenuElement").show();
			$(".headerUserMenuSubEl").hide();	
			
			var user = now.me;
			if (u != undefined) {
				user = u;
			}	
			
			if (user.usernameChanged === true) {
				$("#headerUserChangeUserNameLnk").hide();
			}
			$("#headerUserNameValue").val(user.name);
			
			if (user.hasPassword === true) {
				$("#headerUserChangePWLnk").hide();
				$("#headerUserChangePWChangeLnk").show();
				
				$("#headerUserLogoutLnk").show();
			}					
			else {
				$("#headerUserChangePWLnk").show();
				$("#headerUserChangePWChangeLnk").hide();
				$("#headerUserLogoutLnk").hide();												
			}			
    },
    headerSound: function(self) {
			$(".formSwitchButtons", ".headerUserMenuElement").click(function(e) {
				$(".formSwitchButtons", ".headerUserMenuElement").removeClass("formValueSwitchButtonsActive");
				$(this).addClass("formValueSwitchButtonsActive");

			});     	
    },
    headerChangeUserName: function(self) {
				$("#headerUserChangeUserNameLnk").click(function(e) {
					if (!$("#headerUserChangeUserNameLnk").hasClass("headerUserMenuElementActive")) {
						$(".headerUserMenuElement").hide();
						$(this).next().show();
						$("#headerUserNameValue").focus();
						$("#headerUserNameValue").select();
					}
				});
				
				
				
				
				$("div:last-child", ".headerUserFormButtonRowUser").click(function() {
					now.changeMyUserName($("#headerUserNameValue").val(), function() {
						now.me.usernameChanged=true;
						self.showHeaderUserOverview();						
					});

			
				});
				
				$("div:first-child", ".headerUserFormButtonRowUser").click(function() {
					self.showHeaderUserOverview();			
				});
				
				$("#headerUserNameValue").keyup(function(e) {
					if (e.keyCode === 13) {
						$("div:last-child", ".headerUserFormButtonRowUser").click();
					}
				});    	
    },
    headerSetPw: function(self) {
			// Passwort setzen
			$("#headerUserChangePWLnk").click(function(e) {
					$(".headerUserMenuElement").hide();
					$(this).next().show();
			});								
			
			$("#headerUserNewPassword").keyup(function(e) {
				if (e.keyCode === 13) {
					$("div:last-child", ".headerUserFormButtonRowPw").click();
				}
			}); 			
			
			$("div:last-child", ".headerUserFormButtonRowPw").click(function() {
				
				var pw = $("#headerUserNewPassword").val();
				if (pw != "") {
					var usersalt = MD5(Math.floor(Math.random() * 10000000).toString(16));
					var hashedpw = MD5(pw+usersalt);
					now.changeMyPassword(hashedpw, usersalt, null, function() {
						now.me.hasPassword = true;
						self.showHeaderUserOverview();						
					});
				
				}
			});
			
			$("div:first-child", ".headerUserFormButtonRowPw").click(function() {
				self.showHeaderUserOverview();				
			});		    	
    },
    headerChangePw: function(self) {
			// Passwort ändern
			$("#headerUserChangePWChangeLnk").click(function(e) {
					$(".headerUserMenuElement").hide();
					$(this).next().show();
			});								
			
			$("div:last-child", ".headerUserFormButtonRowChangePw").click(function() {
				var pwalt = $("#headerUserChangePassword").val();
				var pwneu = $("#headerUserChangePassword2").val();
				if (pwalt != "" && pwneu != "") {
					var hashedpwalt = MD5(pwalt+now.me.usersalt);
					var hashedpwneu = MD5(pwneu+now.me.usersalt);
					now.changeMyPassword(hashedpwneu, now.me.usersalt, hashedpwalt, function() {
						$("#headerUserChangePassword2").val($("#headerUserChangePassword2").attr("title"));
						$("#headerUserChangePassword").val($("#headerUserChangePassword").attr("title"));
						$("#headerUserChangePassword").addClass("headerUserChangePasswordInactive");
						$("#headerUserChangePassword2").addClass("headerUserChangePasswordInactive");	
						$("#headerUserChangePassword")[0].type="text";
						$("#headerUserChangePassword2")[0].type="text";
						self.showHeaderUserOverview();								
					});
		
					
				}
			});
			
			$("div:first-child", ".headerUserFormButtonRowChangePw").click(function() {
				$("#headerUserChangePassword2").val($("#headerUserChangePassword2").attr("title"));
				$("#headerUserChangePassword").val($("#headerUserChangePassword").attr("title"));
				$("#headerUserChangePassword").addClass("headerUserChangePasswordInactive");
				$("#headerUserChangePassword2").addClass("headerUserChangePasswordInactive");	
				$("#headerUserChangePassword")[0].type="text";
				$("#headerUserChangePassword2")[0].type="text";										
				self.showHeaderUserOverview();				
			});							
	
	
			$("#headerUserChangePassword").click(function() {
				var t = $(this).attr("title");	
				if ($("#headerUserChangePassword").val() === t) {
					$("#headerUserChangePassword").val("");
					$("#headerUserChangePassword")[0].type="password";
					$("#headerUserChangePassword").removeClass("headerUserChangePasswordInactive");
				}	
				
			});	
			$("#headerUserChangePassword").focus(function() {
				$(this).click();					
			});						
			$("#headerUserChangePassword").change(function() {
				var t = $(this).attr("title");	
				if ($("#headerUserChangePassword").val() == "") {						
					$("#headerUserChangePassword")[0].type="text";
					$("#headerUserChangePassword").val(t);
					$("#headerUserChangePassword").addClass("headerUserChangePasswordInactive");
				}	
				
			});				
			
			$("#headerUserChangePassword2").click(function() {
				var t = $(this).attr("title");	
				if ($("#headerUserChangePassword2").val() === t) {
					$("#headerUserChangePassword2").val("");						
					$("#headerUserChangePassword2")[0].type="password";
					$("#headerUserChangePassword2").removeClass("headerUserChangePasswordInactive");
				}	
				
			});	
			$("#headerUserChangePassword2").focus(function() {
				$(this).click();					
			});					
			$("#headerUserChangePassword2").change(function() {
				var t = $(this).attr("title");	
				if ($("#headerUserChangePassword2").val() == "") {
					$("#headerUserChangePassword2").addClass("headerUserChangePasswordInactive");
					$("#headerUserChangePassword2")[0].type="text";
					$("#headerUserChangePassword2").val(t);
				}	
				
			});		
			
			$("#headerUserChangePassword").keyup(function(e) {
				if (e.keyCode === 13) {
					$("div:last-child", ".headerUserFormButtonRowChangePw").click();
				}
			}); 	
			
			$("#headerUserChangePassword2").keyup(function(e) {
				if (e.keyCode === 13) {
					$("div:last-child", ".headerUserFormButtonRowChangePw").click();
				}
			}); 							
			    	
    },
    headerLogout: function(self) {
			$("#headerUserLogoutLnk").click(function() {
				$.cookie('userid', "");
				$.cookie('accesskey', "");
				location.reload();					
			});	    	
    },
    headerChangeAcc: function(self) {
		// Account wechseln
			$("#headerUserChangeAccLnk").click(function(e) {
					$(".headerUserMenuElement").hide();
					$(this).next().show();
			});								
			
			$("div:last-child", ".headerUserFormButtonRowChangeAcc").click(function() {
				var username = $("#headerUserChangeAccUsername").val();
				var pw = $("#headerUserChangeAccPw").val();
				if (username != "" && pw != "") {
					now.logMeInAsDifferentUser(username, function(usersalt, callback) {
						var hashedpw = MD5(pw+usersalt);
						callback(hashedpw, function(userid, accessKey) {
							if (userid != now.me.id) {
								$.cookie('userid', userid);
								$.cookie('accesskey', accessKey);
								location.reload();
								
								$("#headerUserChangeAccUsername").val($("#headerUserChangeAccUsername").attr("title"));
								$("#headerUserChangeAccPw").val($("#headerUserChangeAccPw").attr("title"));
								$("#headerUserChangeAccPw").addClass("headerUserChangePasswordInactive");
								$("#headerUserChangeAccPw")[0].type="text";
								self.showHeaderUserOverview();												
							}
						});
						
					});


					
				}
			});

			$("div:first-child", ".headerUserFormButtonRowChangeAcc").click(function() {
				$("#headerUserChangeAccUsername").val($("#headerUserChangeAccUsername").attr("title"));
				$("#headerUserChangeAccPw").val($("#headerUserChangeAccPw").attr("title"));
				$("#headerUserChangeAccPw").addClass("headerUserChangePasswordInactive");
				$("#headerUserChangeAccPw")[0].type="text";
				self.showHeaderUserOverview();				
			});							
	
	
			$("#headerUserChangeAccPw").click(function() {
				var t = $(this).attr("title");	
				if ($("#headerUserChangeAccPw").val() === t) {
					$("#headerUserChangeAccPw").val("");
					$("#headerUserChangeAccPw")[0].type="password";
					$("#headerUserChangeAccPw").removeClass("headerUserChangePasswordInactive");
				}	
				
			});	
			$("#headerUserChangeAccPw").focus(function() {
				$(this).click();					
			});						
			$("#headerUserChangeAccPw").change(function() {
				var t = $(this).attr("title");	
				if ($("#headerUserChangeAccPw").val() == "") {						
					$("#headerUserChangeAccPw")[0].type="text";
					$("#headerUserChangeAccPw").val(t);
					$("#headerUserChangeAccPw").addClass("headerUserChangePasswordInactive");
				}	
				
			});			
			
			$("#headerUserChangeAccUsername").click(function() {
				var t = $(this).attr("title");	
				if ($("#headerUserChangeAccUsername").val() === t) {
					$("#headerUserChangeAccUsername").val("");
				}	
				
			});	
			$("#headerUserChangeAccUsername").focus(function() {
				$(this).click();					
			});						
			$("#headerUserChangeAccUsername").change(function() {
				var t = $(this).attr("title");	
				if ($("#headerUserChangeAccUsername").val() == "") {						
					$("#headerUserChangeAccUsername").val(t);
				}	
				
			});	
			
			$("#headerUserChangeAccUsername").keyup(function(e) {
				if (e.keyCode === 13) {
					$("div:last-child", ".headerUserFormButtonRowChangeAcc").click();
				}
			}); 		

			$("#headerUserChangeAccPw").keyup(function(e) {
				if (e.keyCode === 13) {
					$("div:last-child", ".headerUserFormButtonRowChangeAcc").click();
				}
			}); 				
							    	
    },
    headerChangeAvatar: function(self) {
			$("#headerUserChangeAvatar").change(function(e) {
				$("#headerUserChangeAvatarHiddenRef").val(window.location.href);
				$("#headerUserChangeAvatarForm").submit();
			});    	
    }
});
