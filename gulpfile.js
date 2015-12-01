var gulp = require("gulp");
var globals = require("salespreso-gulp/globals");

require("salespreso-gulp")(gulp, {
	"port": 5512,
	"builds": {
		"jspm": {
			"buildDepFile": true
		}
	},
	"serveType": globals.SERVETYPE.JSPM
});
