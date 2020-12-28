module.exports = function (server) {
	return new Plugin(server);
};

class Plugin {
	name = 'ItemsOnJoin';
	version = '0.0.3';
	supported = '>=0.2.0-alpha.9';

	constructor(server) {
		server.on('player-created', function (player) {
			let x = 0;
			Object.keys(server.registry.items).forEach((item) => {
				player.inventory.set(x, item, server.registry.items[item].stack, {});
				x = x + 1;
			});
		});
	}
}
