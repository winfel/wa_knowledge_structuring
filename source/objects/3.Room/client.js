/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*
*/

/**
* @function getInventory
* @return {undefined}
*/
Room.getInventory=function(){
	return Modules.ObjectManager.getObjects();
}

/**
* @param content
* @param callback
*/
Room.saveUserPaintingData=function(content, callback){
	this.serverCall('saveUserPaintingData', content, function(){
		callback();
	});
	
	ObjectManager.paintingUpdate();
}

/**
* @param username
* @return {String}
*/
Room.getUserPaintingURL=function(username){
	if (!username) username = ObjectManager.user.username;
	return "/paintings/"+ObjectManager.getCurrentRoom().id+'/'+username+"/"+(new Date().getTime())+'/'+ObjectManager.userHash;
}

/**
* @param callback
*/
Room.getUserPaintings=function(callback){
	this.serverCall('getUserPaintings', callback);
}

Room.deleteUserPainting=function(){
	this.serverCall('deleteUserPainting', function(){
		//update the view
	});	
}