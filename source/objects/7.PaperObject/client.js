PaperObject.filterObject = function(obj) {

}

PaperObject.selectFile = function(id, name) {

}

PaperObject.hasContent = function() {
    return true;
}

PaperObject.deleteIt = function() {
    this.remove();
}

PaperObject.create = function(attributes) {
    
    if (attributes === undefined) {
        var attributes = {

        };
    } else {
        attributes.padID = new Date().getTime() - 1296055327011;
    } 
    
    ObjectManager.createObject(this.type, attributes);
}
