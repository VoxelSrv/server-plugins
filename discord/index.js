const fs = require('fs');
const Discord = require('discord.js');
const configs = require('../../src/lib/configs');
const chat = require('../../src/lib/chat');
const console = require('../../src/lib/console');


module.exports = {
	name: 'Discord',
	version: '0.0.3',
	supported: '>=0.2.0-beta.8',
	_start: function (server) {
		const client = new Discord.Client();

		const cfg = { token: '', channel: '', ...configs.load('', 'discord') };
		configs.save('', 'discord', cfg)

		if (cfg.token == '') {
			console.log('You need to configure discord plugin!')
			return;
		}

		client.commands = new Discord.Collection();

		client.on('message', (message) => {
			if (message.author.bot) return;
			if (message.channel == cfg.channel) {
				chat.sendMlt([console.executorchat, ...Object.values(players.getAll())], '[Discord] ' + message.member.displayName + ' » ' + message.content);
			}
		});

		server.on('chat-message', function (data) {
			const text = chat.convertToPlain(data);
			client.channels.fetch(cfg.channel).then(function (channel) {
				channel.send(text);
			});
		});

		server.on('system-message', function (data) {
			const text = chat.convertToPlain(data);
			client.channels.fetch(cfg.channel).then(function (channel) {
				channel.send('> ' + text);
			});
		});

		client.on('ready', () => {
			console.log(`Discord: Logged in as ${client.user.tag}!`);
		});

		client.login(cfg.token);
	}
};