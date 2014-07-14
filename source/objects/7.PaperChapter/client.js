PaperChapter.filterObject = function(obj) {

}

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
}