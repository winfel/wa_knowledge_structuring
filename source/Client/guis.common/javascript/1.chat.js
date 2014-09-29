"use strict";

/**
 * @namespace Holding methods and variables to display and send chat messages to other users
 */
GUI.chat = {};

/**
 * counter for new messages (displayed as a badge)
 */
GUI.chat.newMessages = 0;

/**
 * adds components for chat and event handlers for sending chat messages
 */
GUI.chat.init = function() {

	$("#chat").append('<div id="chat_messages"></div><div id="chat_message"><textarea id="chat_message_input"></textarea></div><div id="chat_users"></div>');
	
	$("#chat_message_input").attr("placeholder", GUI.translate("Message"));
	
	$("#chat_message_input").bind("keyup", function(event) {
	
		if (event.which == 13) {
			var val = $(this).val();
			if (jQuery.trim(val) == "") {
				$(this).val("");
				return;
			}
			ObjectManager.tell(val);
			$(this).val("");
		}
		
	});

    $()
	
}

var extract_random = function(elementID){
    var rand_id = $(elementID).attr("id");
    return rand_id.split("-").pop();
};

var minimize_box = function(){
    var rand_id = extract_random(this);
    $('#toggle-chat-'+rand_id).slideToggle();
};

/**
 * Sets active users for chat online list
 * Content of users:
 * [
 * 	{
 * 		color : The assigned (hex-) color of the user	
 * 		username : The username of the user
 *  },
 *  ...
 * ]
 * 
 * @param {UserInfo[]} users Array of active users information
 */
GUI.chat.setUsers = function(users) {
	$("#chat_users").html("");
	for (var i = 0; i < users.length; i++) {
		var user = users[i];
        if (user['username'] == ObjectManager.user['username']){
            continue;
        }
		$("#chat_users").append('<div class="chatuserhandle"><span style="background-color: '+user.color+'"></span>'+user.username+'</div>');
	}

    $(".chatuserhandle").click(function(){
        var usr = $(this).text();

        var random_id = Math.floor((Math.random()*10000)+1);
        GUI.chat.createChatbox(usr, random_id);
    });

    $(function() {
        $( ".chatuserhandle" ).draggable({helper: 'clone', zIndex: 300});
    });
}


/**
 * clears all chat messages
 */
GUI.chat.clear = function() {
	
	$("#chat_messages").html('<span id="chat_messages_spacer"></span>');

}

/**
 * add a single message to the chat window
 * @param {String} username The username of the sender
 * @param {String} text The text of the message
 * @param {String} [userColor=#000000] The senders user color
 * @param {Boolean} read True, if it is an old message
 */
GUI.chat.addMessage = function(username, text, userColor, read) {
	/* check if the message was send by the own user */
	if (username == GUI.username) {
		var type = "mine";
	} else {
		
		var type = "other";
		
		if (!read && (GUI.sidebar.currentElement != "chat" || !GUI.sidebar.open)) {
			GUI.chat.newMessages++;
			GUI.chat.showNotifier();
		}
		
	}
	
	/* set default user color */
	if (userColor == undefined) {
		var userColor = "#000000";
	}
	
	text = text.replace(/<(?:.|\n)*?>/gm, '');
	
	/* emoticons */
	
	var replaceEmoticon = function(code, image, str) {
		
		code = code.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
		
		var replacer = new RegExp(code,"g");

		return str.replace(replacer,'<img src="/guis.common/images/emoticons/'+image+'" alt="" />');
		
	}
	

	
	text = replaceEmoticon(':)', 'emoticon_smile.png', text);
	text = replaceEmoticon(':D', 'emoticon_grin.png', text);
	text = replaceEmoticon(':P', 'emoticon_tongue.png', text);
	text = replaceEmoticon(':(', 'emoticon_unhappy.png', text);
	text = replaceEmoticon('(tux)', 'tux.png', text);
	text = replaceEmoticon(':o', 'emoticon_surprised.png', text);
	text = replaceEmoticon(';D', 'emoticon_wink.png', text);
	text = replaceEmoticon('<3', 'heart.png', text);
	text = replaceEmoticon('(ghost)', 'ghost.png', text);
	
	var date = new Date();
	var timestamp = (date.getHours()<10 ? '0' : '') + date.getHours() + ':' +(date.getMinutes()<10 ? '0' : '') + date.getMinutes() + ':' +(date.getSeconds()<10 ? '0' : '') + date.getSeconds();

	$("#chat_messages").append('<div class="chat_message_'+type+'"><span style="color: '+userColor+'">'+username+' ('+timestamp+')</span>'+text+'</div>');
	

	$("#chat_messages").scrollTop(200000); //scroll down

}

/**
 * add a single message to the chat box, and calls the createChatbox as well,
 * to create the new box or show an old one.
 * @function addMessageOne
 * @param {String} username The username of the sender
 * @param {String} text The text of the message
 * @param {Boolean} read True, if it is an old message
 */
GUI.chat.addMessageOne = function(username, text, userColor, read) {
    var windowTitle = text.receiver; // shows the receiver of chatbox
    if (username == GUI.username) {
        // sender is myself
        var type = "mine";
         windowTitle = text.receiver;
    }
    else {
        // sender is someone else --> it is a received message
        windowTitle = username;
        if (text.receiver != GUI.username){
            return;
        }
    }

    // doesn't create if one already exist
    GUI.chat.createChatbox(windowTitle, text.random_id);
    var bubble = text.bubble;
    var message_box_id = '#message-box-' + text.random_id;
    $(bubble).hide().appendTo(message_box_id).fadeIn();

    //keep scrolled to bottom of chat!
    var scrolltoh = $(message_box_id)[0].scrollHeight;
    $(message_box_id).scrollTop(scrolltoh);

    $( draggablize );

    function draggablize() {
        $('.draggable-word').draggable({helper: "clone"});
    }

}

/**
 * called when chat is opened in GUI
 */
GUI.chat.opened = function() {
	GUI.chat.newMessages = 0;
	GUI.chat.hideNotifier();
	//$("#chat_message_input").focus(); //TODO: chrome bug
}


/**
 * show a notification (e.g. an icon badge) with the number of unread messages
 * called by GUI.chat.addMessage
 */
GUI.chat.showNotifier = function() {
	$("#chat_notifier").html(GUI.chat.newMessages);
	$("#chat_notifier").css("opacity", 1);
}

/**
 * hide the notification
 */
GUI.chat.hideNotifier = function() {
	$("#chat_notifier").css("opacity", 0);
}

/**
 * Creates a new chat box if it already doesn't exist. If a message
 * has already been sent to a user and the window is closed, instead
 * of creating a new box the existing one will be shown again. Every
 * new box gets a random number for identification purpose.
 * @function createChatbox
 * @param {String} user username that has been clicked on in the sidebar
 * @param {Int} random_id null if it is a new chat box, and the random identification number if an old closed box wanted to be shown
 */
GUI.chat.createChatbox = function(user, random_id) {

    if ( $("#chat-"+user).length != 0 ){
        $("#chat-"+user).show();
        // window already exists
        return;
    }

    if (!random_id){
        var random_id = Math.floor((Math.random()*10000)+1);
    }
    var newbox =
        '<div class="chat-box" id="chat-' +user+ '">\
            <div class="chat-header"> <span class="receiver">' +user+ '</span>'+
                '<div id="close-btn-'+ random_id +'" class="close_btn">&nbsp;</div>\
                <div id="minimize-btn-'+ random_id +'" class="minimize_btn">&nbsp;</div>\
            </div>\
            <div class="toggle_chat" id="toggle-chat-'+random_id+'">\
                <div class="message-box" id="message-box-'+random_id+'">\
                </div>\
                <div class="user-info">\
                    <textarea name="chat-message" id="chat-message-' +random_id /*id="chat-message"*/ +'" placeholder="Type Message Hit Enter" maxlength="100" />\
                </div>\
            </div>\
        ';

    $("#one2one-container").append(newbox).css("display", "block");

    $(".close_btn").click(function(){
        $(this).parent().parent().hide();
    });


    $('#minimize-btn-'+random_id).dblclick(minimize_box);
    $('#minimize-btn-'+random_id).click(minimize_box);

    $("#chat-message-"+random_id).keypress(function(evt) {
        if(evt.which == 13) {
            var val = $(this).val();
            if (jQuery.trim(val) == "") {
                $(this).val("");
                return;
            }

            var iusername = ObjectManager.user['username'];
            var imessage = $(this).val();
            var post_data = {'sender':iusername, 'message':imessage};

            var d = new Date;
            var months = ['Jan', 'Feb', 'Mar', 'Apr','May', 'Jun','Jul', 'Aug','Sep', 'Oct','Nov', 'Dec'];
            var msg_time = d.getHours()+':'+ d.getMinutes()+ ' '+ months[d.getMonth()] +' ' + d.getDay();

            var special_texts = ['circle', 'paper', 'rectangle', 'file'];

            var replace_text = function(spcialtext){
                if (imessage.indexOf(spcialtext)>=0){
                    imessage = imessage.replace(spcialtext, '<span class="draggable-word">'+spcialtext+'</span>');
                }
            };

            var i, len;
            for (i = 0, len = special_texts.length; i < len; i++) {
                replace_text(special_texts[i]);
            }

            var bubble =
                '<div class="chat-msg">\
                    <time>' +msg_time+'</time>' +
                    '<span class="username">'+iusername+'</span>' +
                    '<span class="message">'+imessage+'</span>\
                    </div>';

            //reset value of message box
            $(this).val('');
            ObjectManager.tellOne({'bubble':bubble, 'sender':iusername, 'receiver': user,'random_id':random_id});
        }
    });
};