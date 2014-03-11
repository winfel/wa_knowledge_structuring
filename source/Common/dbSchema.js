var Schema = {};

/**
*		Table: Users
*		|-----------------------------------|
*		|	Username	|	Password		|
*		|
*/
schema.userSchema = mongoose.Schema({
    username: String,
  password: String
});

/**
*		Table: Rights
*		|-----------------------------------|
*		|	id			|	Name			|
*		|
*/
schema.rightSchema =  mongoose.Schema({
    id: String,
  name: String
});	

/**
*		Table: Roles
*		|---------------------------------------------------------------------------------------|
*		|	id	|	contextID	|	name	|	rights (array)	|	mode	|	users (array)	|
*		|
*/
schema.roleSchema = mongoose.Schema({
    	id: String,
 contextID: String,
  	  name: String,
    rights: Array,
      mode: String,
     users: Array
});

module.exports=Schema;