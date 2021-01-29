const Discord = require('discord.js');

const api = require('voxelservercore/api')

module.exports = function (server) {
	return new Plugin(server);
};

class Plugin {
	name = 'Discord';
	version = '0.0.7';
	game = '*';
	supportedGameAPI = '*';
	supportedAPI = '0.2.1';
	constructor(server) {
		const client = new Discord.Client();

		const cfg = { token: '', channel: '', ...server.loadConfig('', 'discord') };
		server.saveConfig('', 'discord', cfg);

		if (cfg.token == '') {
			console.log('You need to configure discord plugin!');
			return;
		}

		const broadcast = (msg) => {
			server.players.sendMessageToAll(msg);
			server.log.chat(msg);
		};

		client.commands = new Discord.Collection();

		client.on('message', (message) => {
			if (message.author.bot) return;
			if (message.channel == cfg.channel) {
				broadcast('[Discord] ' + message.member.displayName + ' » ' + message.content);
			}
		});

		server.on('chat-message', function (data) {
			const text = api.MessageStringify(data.getOutput());
			client.channels.fetch(cfg.channel).then(function (channel) {
				channel.send(text);
			});
		});

		server.on('player-create', function (data) {
			client.channels.fetch(cfg.channel).then(function (channel) {
				channel.send(`> ${data.displayName} joined the game!`);
			});
		});

		server.on('player-quit', function (data) {
			client.channels.fetch(cfg.channel).then(function (channel) {
				channel.send(`> ${data.displayName} left the game!`);
			});
		});

		client.on('ready', () => {
			console.log(`Discord: Logged in as ${client.user.tag}!`);
		});

		client.login(cfg.token);
	}
}
