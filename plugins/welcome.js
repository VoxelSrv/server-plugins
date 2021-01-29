module.exports = function (server) {
	return new Plugin(server);
};

class Plugin {
	name = 'Welcome';
	version = '0.0.5';
	game = '*';
	supportedGameAPI = '*';
	supportedAPI = '>=0.2.1';

	constructor(server) {
		const load = { text: ['Hello there!'], ...server.loadConfig('', 'welcome') };

		let cfg = [];
		if (load.text.length > 0) cfg = load.text;

		server.saveConfig('', 'welcome', load);

		server.on('player-join', function (player) {
			setTimeout(function () {
				cfg.forEach(function (text) {
					player.send(text);
				});
			}, 500);
		});
	}
}
