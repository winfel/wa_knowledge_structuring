var PaperEntity = {};

PaperEntity.id;
PaperEntity.name;
PaperEntity.isMain = true;
PaperEntity.children = [];
PaperEntity.contentType;
PaperEntity.content;

PaperEntity.tags = [];
PaperEntity.authors = [];

/**
 *  creates new Paper Object.
 *  
 *  @param {type} toInherit attributes to set
 */
PaperEntity.createNew = function(toInherit) {
    // TODO
};

/**
 * 
 */
PaperEntity.addChild = function() {
    // TODO
};

/**
 * 
 */
PaperEntity.deleteChild = function() {
    // TODO
};

/**
 * 
 */
PaperEntity.getTags = function() {
    return this.tags;
};

/**
 * 
 */
PaperEntity.getAuthors = function() {
    return this.authors;
};

module.exports = PaperEntity;