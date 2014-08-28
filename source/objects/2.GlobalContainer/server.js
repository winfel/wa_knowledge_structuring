/**
 * Webarena - A web application for responsive graphical knowledge work
 * 
 * University of Paderborn, 2014
 * 
 */

"use strict";

var theObject = Object.create(require('./common.js'));
var Modules = require('../../server.js');

var TRASH_ROOM = 'trash';

theObject.getAllFileObjects = function(cb) {
    Modules.Connector.getObjectDataByQuery({mainTag: this.getAttribute('name'), inRoom: {$nin:[TRASH_ROOM] } }, cb);
}

theObject.changeMainTag = function(d) {

    Modules.ObjectManager.getObject(d.room, d.id, true, function(o) {
        o.setAttribute('mainTag', d.tag);
        o.setAttribute('secondaryTags', []);
    });

}

theObject.getAllFileObjects.public = true;
theObject.changeMainTag.public = true;

module.exports = theObject;
