const Plugin = require('./dist/').Plugin;

module.exports = function (server) {
	return new Plugin(server);
};
