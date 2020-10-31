module.exports = function (server) {
	return new Plugin(server);
};

const configs = require('voxelsrv-server/dist/lib/configs');

class Plugin {
	name = 'Welcome';
	version = '0.0.3';
	supported = '>=0.2.0-alpha.8';
	constructor(server) {
		const load = { text: ['Hello there!'], ...configs.load('', 'welcome') };

		let cfg = [];
		if (load.text.length > 0) cfg = load.text;

		configs.save('', 'welcome', load);

		server.on('player-join', function (player) {
			setTimeout(function () {
				cfg.forEach(function (text) {
					player.send(text);
				});
			}, 500);
		});
	}
}
