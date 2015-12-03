var karmaConfig = require("karma-config");

module.exports = function(config) {
	config.set(karmaConfig(config, {
		coverage: "src/lib/**/*.js",
		testBootup: "src/test/test-bootup.js",
		serveFiles: ["src/test/**/*", "src/lib/**/*"]
	}));
};
