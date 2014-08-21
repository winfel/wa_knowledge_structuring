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
    var that = this;
    var fileObjects = new Array();
    var containerTag = that.getAttribute('name');

    Modules.Connector.listRooms(function(n, rooms) {
        
        function recursive(i) {
            if (i < rooms.length) {
                var room = rooms[i];
                
                if (room.id == TRASH_ROOM) {
                    recursive(i + 1);
                } else {
                    Modules.Connector.getInventory(room.id, true, function(inventory) {
                        for (var k in inventory) {
                            if (inventory[k].type == "File" && containerTag == inventory[k].attributes.mainTag) {
                                fileObjects.push(inventory[k]);
                            }
                        }
                        
                        recursive(i + 1);
                    });
                }
            } else {
                cb(fileObjects);
            }
        }
        
        recursive(0);
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
