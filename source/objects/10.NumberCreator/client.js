/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2012
 *
 */


NumberCreator.justCreated = function() {
  var testClientGrantAccess 	= false;
  var testClientRevokeAccess 	= false;
  var testClientGetRights 		= false;
  var testClientGetRoles      = false;
  var testClientGetUsers      = true;

  if(testClientGetRights === true){
  	console.log(">>> TESTING CLIENT GET RIGHTS <<<");
  	Modules.RightManager.getRights({id: 1, type: "NumberCreator"}, "Boss", GUI.username, function(result) {
  		console.log("GET RIGHTS ON CLIENT SIDE");
  	});
  }

  if(testClientGetRoles === true){
    console.log(">>> TESTING CLIENT GET ROLES <<<");
    Modules.RightManager.getRolesForObject({id: 1, type: "NumberCreator"}, function(result) {
      console.log("GET ROLES FOR OBJECT");
      console.log(result);
    });
  }

  if(testClientGetUsers === true){
    console.log(">>> TESTING CLIENT GET Users <<<");
    Modules.RightManager.getAllUsers(function(result) {
      console.log("GET All Users");
      console.log(result);
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
