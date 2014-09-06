/**
* @param obj
*/
PaperChapter.filterObject = function(obj) {

}

/**
* @param id
* @param name
*/
PaperChapter.selectFile = function(id, name) {

}

PaperChapter.hasContent = function() {
    return true;
}

PaperChapter.createReview = function() {
    // TODO
}

PaperChapter.exportFile = function() {
    // TODO
}

PaperChapter.open = function() {
    // TODO
}

PaperChapter.publish = function() {
    // TODO
}

PaperChapter.deleteIt = function() {
    this.remove();
}

PaperChapter.justCreated = function(){
  var inv = ObjectManager.getCurrentRoom().getInventory();

        for (var i in inv) {
            if(inv[i].type == "Writer"){

                this.setAttribute('writer',inv[i].id);
            }
        }


    /* generate new chapterID */
    var random = new Date().getTime() - 1296055327011;

    this.setAttribute('chapterID', random);
}