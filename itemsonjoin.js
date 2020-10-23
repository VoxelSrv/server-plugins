module.exports = {
	name: 'ItemsOnJoin',
	version: '0.0.2',
	supported: '>=0.2.0-alpha.8',
	_start: function (server) {
		server.on('player-join', function (player) {
			let x = 0;
			Object.keys(server.registry.items).forEach((item) => {
				player.inventory.set(x, item, server.registry.items[item].stack, {});
				x = x + 1;
			});
		});
	}
};
