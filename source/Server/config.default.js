/**
*    Webarena - A web application for responsive graphical knowledge work
*
*    @author Felix Winkelnkemper, University of Paderborn, 2012
*	 @class config.default
*	 @classdesc default settings for port, language, filebase, etc.
*	 @requires FileConnector
*
*/

module.exports={
	filebase:'/path/to/data_folder', // The path where object data is saved (for the fileConnector)
	connector:require('./FileConnector.js'), // The chosen connector
	language:'de', // The current language (e.g. for error messages)
	port: 8080,     // HTTP Port for server
	homepage: '/index.html',
	tcpApiServer: false,
	imageUpload: {
		maxDimensions: 400
	},
	easydb: {
		apiUrl: "easydb.uni-paderborn.de",
		apiPath: "/easy/fs.php?",
		username: "",
		password: ""
	},
	sharepoint: {
		basepath: "https://projects.uni-paderborn.de/websites/studiolo/"
	},
	bidServer: 'www.bid-owl.de.localhost',
	bidPort: 80,
	elab: {
		filebase : '', // folder where the user management data is saved
		encryptionKey : '' // used as salt to create a hash of the user password (needs to be the same as on the user management platform)
	},
	logLevels : {
		"warn" : true,
		"debug" : false,
		"info" : false
	},
	objectWhitelist: [],	//an empty whitelist whitelists everything
	objectBlacklist: ['HtmlTest'],    //Syntax: objectBlacklist:['SharePoint','EasyDBImage']
	debugMode: false,
	etherpadlite : {
        apikey: "",
        host: "localhost",
        port: 9001,
        
        // Right now just for Windows
        startFilePath: "<path_where_the_start_file_is>",
        startFile: "start.bat"
    },
    wkhtmltox: {
        path: ""
    },
    etherpadStartFile: ""
};