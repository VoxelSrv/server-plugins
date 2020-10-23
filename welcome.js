module.exports = {
	name: 'Welcome',
	version: '0.0.2',
	supported: '>=0.2.0-alpha.8',
};

const configs = require('../src/lib/configs');

const load = { text: ['Hello there!'], ...configs.load('', 'welcome') };

let cfg = [];
if (load.text.length > 0) cfg = load.text;

configs.save('', 'welcome', load);

module.exports._start = function (server) {
	server.on('player-join', function (player) {
		setTimeout(function () {
			cfg.forEach(function (text) {
				player.send(text);
			});
		}, 500);
	});
};
