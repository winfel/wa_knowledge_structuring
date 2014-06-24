/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    University of Paderborn, 2014
*
*/

/*
Container.afterSetContent=function(){

	GUI.updateLayers();

}

Container.afterSetAttribute=function(){

	GUI.updateLayers();

}
*/


Container.getFiles = function(){
	
	var o = new Array();
	
	var objects = ObjectManager.getObjects();
	
	var key;
	for (key in objects) {
		
		if(objects[key].type == "File"){
		
			o.push(objects[key]);
			
		}
		
	}
	
	return o;
	
}