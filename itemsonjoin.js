module.exports = {
	name: 'ItemsOnJoin',
	version: '0.0.2',
	supported: '>=0.2.0-alpha.4',
};

const { registry, players } = require('server');

players.event.on('create', function (player) {
	let x = 0;
	Object.keys(registry.itemRegistry).forEach((item) => {
		player.inventory.set(x, item, registry.itemRegistry[item].stack, {});
		x = x + 1;
	});
});
