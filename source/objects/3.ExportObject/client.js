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