/**
 * Webarena - A web application for responsive graphical knowledge work
 * 
 * @author Felix Winkelnkemper, University of Paderborn, 2012
 * 
 */

var Modules = require('../../server.js');

/**
 * PaperObject
 * 
 * @class
 * @classdesc Common elements for view and server
 */

var PaperObject = Object.create(Modules.ObjectManager.getPrototype('IconObject'));

/**
 * Registers the object (actions).
 * 
 * @this {PaperObject}
 * @see Client/ObjectManager.js
 * @see objects/2.IconObject/common.js
 * @see objects/1.GeneralObject/common.js
 * @param {string} type The type of the object
 */
PaperObject.register = function(type) {

    // Registering the object
    IconObject = Modules.ObjectManager.getPrototype('IconObject');
    IconObject.register.call(this, type);

    var self = this;

    this.registerAction('Follow', function(object) {

        object.execute();

    }, true);

    this.registerAction('Open in new window', function(object) {

        object.execute(true);

    }, true);

function addroles(){
        var roleDialog =$( ''+
        '<div id="addrole-dialog">' +
        '<h3>Adding roles</h3>'+
        '<input type="checkbox" id="hacker"> Hacker </input>'+ '<br>'+
        '<input type="checkbox" id="monkey"> Programming Monkey </input>'+'<br>'+
        '<input type="checkbox" id="supervisor"> Supervisor </input>'+'<br>'+
        '<input id="own" placeholder="Your own role">'
         );

        var roleButtons = {
            "Abbrechen":function () {
                setDialog();
            },
            "Save":function () {
        Modules.UserManager.getRoles({id:1}, GUI.username, function(roles){
        var pageOneContent2 = '' +
        '<div id="easydb-dialog">' +
        '<h3>Roles</h3>';

        roles.forEach (function(item){
            pageOneContent2 += '<input style="margin-top:0px;" class="maxWidth" placeholder="'+item.name+': ' + item.rights+'">';
            });

        console.log("Hacker id: "+$("#hacker").is(":checked"));
        if ($("#hacker").is(":checked")) 
        {
            pageOneContent2 += '<input style="margin-top:0px;" class="maxWidth" placeholder="Hacker">'; 
        };

        pageOneContent2 +='<h3>Userlists</h3>';

        roles.forEach (function(item){
            pageOneContent2 += '<input style="margin-top:0px;" class="maxWidth" placeholder="'+item.name+': ' + item.users+'">';
            });

        pageOneContent2 +='</div>';

        var pageOneContent =$(pageOneContent2);


        var dialog = GUI.dialog(
           "Right manager for PaperObject",
           pageOneContent, pageOneButtons, 500, {height:400}
       )

        });
            }
        }

         var dialog = GUI.dialog(
           "Role manager for PaperObject",
           roleDialog, roleButtons, 500, {height:300}
       );
    
 };      
        var pageOneButtons = {
            "Abbrechen":function () {
                return false;
            },
            "OK":function () {
                return true;
            },
            "AddRoles": function(){
                addroles();
            }

        }


    function setDialog(){
        Modules.UserManager.getRoles({id:1}, GUI.username, function(roles){
        var pageOneContent2 = '' +
        '<div id="easydb-dialog">' +
        '<h3>Roles</h3>';

        roles.forEach (function(item){
            pageOneContent2 += '<input style="margin-top:0px;" class="maxWidth" placeholder="'+item.name+': ' + item.rights+'">';
            });

        pageOneContent2 +='<h3>Userlists</h3>';

        roles.forEach (function(item){
            pageOneContent2 += '<input style="margin-top:0px;" class="maxWidth" placeholder="'+item.name+': ' + item.users+'">';
            });

        pageOneContent2 +='</div>';

        var pageOneContent =$(pageOneContent2);


        var dialog = GUI.dialog(
           "Right manager for PaperObject",
           pageOneContent, pageOneButtons, 500, {height:400}
       )

        });
    };


    //Test Dialog for Right mMnager
    this.registerAction('Right manager', function(object) {

        setDialog();

    }, true);
	
    
    this.registerAttribute('isMain', {type:'boolean', hidden:true});
    this.registerAttribute('bigIcon',{hidden:true});
}

/**
 * Opens the paper object with the help of the attribute 'destination'. If the
 * destination is not set the destination will choose randomly.
 * 
 * @this {PaperObject}
 * @see Client/ObjectManager.js
 * @see objects/1.GeneralObject/common.js
 * @param {boolean} openInNewWindow
 */
PaperObject.execute = function(openInNewWindow) {
    var destination = this.getAttribute('destination');

    if (!destination) {
        var random = new Date().getTime() - 1296055327011;

        this.setAttribute('destination', random);
        destination = random;
    }

    if (openInNewWindow) {
        window.open(destination);
    } else {
        ObjectManager.loadPaperWriter(destination, false, 'left');
    }
}

PaperObject.register('PaperObject');
PaperObject.isCreatable = true;

PaperObject.category = 'Rooms';

module.exports = PaperObject;