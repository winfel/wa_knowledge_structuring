/**
 * Webarena - A web application for responsive graphical knowledge work
 * 
 * @author Felix Winkelnkemper, University of Paderborn, 2012
 * 
 */

"use strict";

var theObject = Object.create(require('./common.js'));
var Modules = require('../../server.js');


theObject.createNew = function() {
    // TODO
    var p = new PaperEntity();
    p.createNew(null);
}

/**
* @param object
* @param oldData
* @param newData
*/
theObject.onEnter=function(object,oldData,newData){
    var that = this;

    var createChapter = function(data) {
        var cpadID = new Date().getTime() - 1296055327011;
        Modules.EtherpadController.pad.createPad(cpadID);
        //Modules.EtherpadController.pad.setText(cpadID, data);

        Modules.ObjectManager.createObject(that.getRoomID(), "PaperChapter", {
                x: 10,
                y: 10,
            hasContent : true,  // prevent calling justCreated() after object
                                // creation (would display file upload dialog)
                name: "Merged Chapter",
        }, data, that.context, function(dummy, newObject) {

                newObject.set('chapterID',cpadID);
                newObject.persist();
        });

        Modules.ObjectManager.createObject(that.getRoomID(), "SimpleText", {
                x: 10,
                y: 10,
            hasContent : true,  // prevent calling justCreated() after object
                                // creation (would display file upload dialog)
                name: "Merged Text",
        }, data, that.context);
    };

    // get id of the chapter
    var id = object.getAttribute('chapterID');

    Modules.EtherpadController.pad.getText({
        padID : id
    }, function(error, data) {
        if(error) {
            console.error("PadID "+ object.getAttribute('padID') + " >> Error pad.getText: ", error.message);
            return;
            }

        // increase counter
        var count = that.getAttribute('count');
        that.setAttribute(Number(count) + 1);

        // update text
        if(Number(count) == 1){
            that.setAttribute('textcontent', "");
        }

        var tcontent = that.getAttribute('textcontent');
        tcontent += "<br>" + data.text;
        that.setAttribute('textcontent', tcontent);

        // create new chapter if needed
        if(count % 2 == 0){
            createChapter(tcontent);
            that.setAttribute('textcontent', "");
        }
    });
}

theObject.createReview = function() {
    // TODO
}

theObject.exportFile = function() {
    // TODO
}

theObject.open = function() {
    // TODO
}

theObject.deleteIt = function() {
    // TODO
}

theObject.addChild = function() {
    // TODO
}

theObject.deleteChild = function() {
    // TODO
}

theObject.publish = function() {
    // TODO
}

theObject.commonRegister = theObject.register;

module.exports = theObject;