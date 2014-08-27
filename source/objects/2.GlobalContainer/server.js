/**
 * Webarena - A web application for responsive graphical knowledge work
 * 
 * University of Paderborn, 2014
 * 
 */

"use strict";

var _ = require('underscore');

var theObject = Object.create(require('./common.js'));
var Modules = require('../../server.js');

var TRASH_ROOM = 'trash';

theObject.getAllFileObjects = function(cb) {
    var fileObjects = new Array();
    var containerTag = this.getAttribute('name');
    
    Modules.Connector.getObjectDataByQuery({mainTag: containerTag}, function(objects) {
        cb(_.filter(objects, function(obj){ return obj.inRoom != TRASH_ROOM; }));
    });
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
