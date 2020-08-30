module.exports = {
	name: 'Discord',
	version: '0.0.2',
	supported: '>=0.2.0-alpha.4',
};

const fs = require('fs');
const Discord = require('discord.js');
const client = new Discord.Client();

const { chat, console, configs } = require('server');

const cfg = { token: '', channel: '', ...configs.load('', 'discord') };
configs.save('', 'discord')

if (cfg.token == '') {
	console.log('You need to configure discord plugin!')
	return;
}

client.commands = new Discord.Collection();

client.on('message', (message) => {
	if (message.author.bot) return;
	if (message.channel == cfg.channel) {
		chat.send('#all', '**[Discord]** ' + message.member.displayName + ' » ' + message.content);
	}
});

chat.event.on('chat-message', function (data) {
	const text = chat.convertToPlain(data);
	client.channels.fetch(cfg.channel).then(function (channel) {
		channel.send(text);
	});
});

chat.event.on('system-message', function (data) {
	const text = chat.convertToPlain(data);
	client.channels.fetch(cfg.channel).then(function (channel) {
		channel.send('>' + text);
	});
});

client.on('ready', () => {
	console.log(`Discord: Logged in as ${client.user.tag}!`);
});

client.login(cfg.token);
