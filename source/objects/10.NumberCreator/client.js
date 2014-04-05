/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2012
 *
 */


NumberCreator.justCreated = function() {
  var testClientGrantAccess 	= true;
  var testClientRevokeAccess 	= true;
  var testClientGetRights 		= false;

  if(testClientGetRights === true){
  	console.log(">>> TESTING CLIENT GET RIGHTS <<<");
  	Modules.RightManager.getRights({id: 1, type: "NumberCreator"}, "Boss", GUI.username, function(result) {
  		console.log("GET RIGHTS ON CLIENT SIDE");
  	});
  }

  if(testClientGrantAccess === true){
  	console.log(">>> TESTING CLIENT GRANT ACCESS <<<");
  	Modules.RightManager.grantAccess("IMBAAccess",{id: 1, type: "NumberCreator"}, "Boss", GUI.username);
  }

  if(testClientRevokeAccess === true){
  	console.log(">>> TESTING CLIENT REVOKE ACCESS <<<");
  	Modules.RightManager.revokeAccess("IMBAAccess",{id: 1, type: "NumberCreator"}, "Boss", GUI.username);
  }
//  this.getRoom().createObject('Textarea', function(err, obj) {
//    obj.setAttribute('name', 'logger2');
//    insertText(obj, object);
//  });
};
