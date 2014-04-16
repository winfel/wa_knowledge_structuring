var db = require('monk')('localhost/WebArena');

var Modules = false;

var fillCurrentDbWithTestData = function() {

	//TODO
	
	
	
	
	
	
	/*
	var pushMainTags = ['1#HMI#a#b#c', '2#ST#d#e#f', "3#ES#g#h#i", "4#A#j#k#l"];

	/* clear table */
	db.get('MainTags').drop();

	/* push test tags */
	/*
	var collection = db.get('MainTags');
	pushMainTags.forEach(function(item) {
		var token = item.split("#");
		collection.insert({id: String(token[0]), name: String(token[1]), secTags: String(token[3])});
	});
	*/
};



var TagManager = function() {
	//fillCurrentDbWithTestData();
	
	var that = this;
	
   /**
   *		The function is needed to initialize the TagManager
   *
   */
  this.init = function(theModules) {
    Modules = theModules;
    var Dispatcher = Modules.Dispatcher;

    Dispatcher.registerCall('getMainTags', function(socket, data, responseID) {
		that.getMainTags(socket);
	});

    Dispatcher.registerCall('getSecTags', function(socket, data, responseID) {
		that.getSecTags(socket, data.mainTag); 
	});
 
  };
  
	/**
	* 
	* @param {type} object
	* @returns {undefined}
	*/
	this.getMainTags = function(socket) {
	  
	//TODO: get mainTags from the DB
	var mainTags = "Algorithms";
	
	Modules.SocketServer.sendToSocket(socket, "getMainTags", mainTags);
	 
	};
	
		/**
	* 
	* @param {type} object
	* @returns {undefined}
	*/
	this.getSecTags = function(socket, mainTag) {
	  
	//TODO: get SecTags from the DB
	var SecTags = "Cryptology";

	Modules.SocketServer.sendToSocket(socket, "getSecTags", SecTags);
	 
	};
  
};

module.exports = new TagManager();