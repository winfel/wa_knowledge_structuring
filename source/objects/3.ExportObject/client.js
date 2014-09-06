/*ExportObject.contentUpdated=function(){

	this.updateIcon();
	
};
*/

/**
 * returns papers in the same room
 */
ExportObject.getSurroundingPapers = function(callback) {
	var inventory = this.getRoom().getInventory();
	var papers = new Array();
	for(var i in inventory) {
		if(inventory[i].getType() == 'PaperSpace'
			|| inventory[i].getType() == 'PaperChapter'
			|| inventory[i].getType() == 'PaperObject')
		papers.push(inventory[i]);
	}
	if(callback) {
		callback(papers);
	}
	return papers;
}

/**
 * exports the associated papers to the desired mimetype as file at position
 */
ExportObject.exportAsFile = function(type, position) {
	this.serverCall('exportAsFile', type, position, false);
}

/**
 * exports the associated papers to the desired mimetype under a url
 */
ExportObject.exportAsUrl = function(type) {
	// we need to open the window immediate, as otherwise it is not associated to a users click and will be blocked by popup blockers
	var deferredWindow = window.open('data:,waitforit', '_blank');
	this.serverCall('exportAsUrl', type, function(url){
		deferredWindow.location = url;
	});
}