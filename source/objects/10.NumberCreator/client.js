/**
 *    Webarena - A web application for responsive graphical knowledge work
 *
 *    @author Felix Winkelnkemper, University of Paderborn, 2012
 *
 */


NumberCreator.justCreated = function() {
  console.log(this);

  Modules.RightManager.getRights({id: 1, type: "NumberCreator"}, "Boss", GUI.username, function(result) {
    console.log("GET RIGHTS ON CLIENT SIDE");
  });
//  this.getRoom().createObject('Textarea', function(err, obj) {
//    obj.setAttribute('name', 'logger2');
//    insertText(obj, object);
//  });
};
