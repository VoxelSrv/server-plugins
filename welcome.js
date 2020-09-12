module.exports = {
	name: 'Welcome',
	version: '0.0.2',
	supported: '>=0.2.0-alpha.4',
};

const { players, configs } = require('server');

const load = { text: ['Hello there!'], ...configs.load('', 'welcome') };

let cfg = [];
if (load.text.length > 0) cfg = load.text;

configs.save('', 'welcome', load);

players.event.on('create', function (player) {
	setTimeout(function () {
		cfg.forEach(function (text) {
			player.send(text);
		});
	}, 500);
});
