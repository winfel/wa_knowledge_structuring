var mongoose = require('mongoose');

var Schema = {};

/**
*		Table: Users
*		|-----------------------------------|
*		|	Username	|	Password		|
*		|
*/
Schema.userSchema = mongoose.Schema({
    username: String,
  password: String
});

/**
*		Table: Rights
*		|-----------------------------------|
*		|	id			|	Name			|
*		|
*/
Schema.rightSchema =  mongoose.Schema({
    id: String,
  name: String
});	

/**
*		Table: Roles
*		|---------------------------------------------------------------------------------------|
*		|	id	|	contextID	|	name	|	rights (array)	|	mode	|	users (array)	|
*		|
*/
Schema.roleSchema = mongoose.Schema({
    	id: String,
 contextID: String,
  	  name: String,
    rights: Array,
      mode: String,
     users: Array
});

module.exports=Schema;