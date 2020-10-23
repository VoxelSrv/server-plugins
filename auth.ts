import type { Server } from '../src/server';
import * as configs from '../src/lib/configs';
import * as chat from '../src/lib/chat';
import { Command } from '../src/lib/registry';


export const name = 'Auth';
export const version = '0.0.2';
export const supported = '>=0.2.0-alpha.8';

export let isLogged: (name) => boolean;

export const _start = (server: Server) => {
	const sessions = {};

	let playerdata = {};

	function saveDatabase() {
		configs.save('storage', 'auth', playerdata);
	}

	playerdata = configs.load('storage', 'auth');

	function isLogged(name) {
		if (sessions[name] == true) {
			return true;
		} else {
			return false;
		}
	}

	exports.isLogged = isLogged

	function cancel(name, obj) {
		var x = isLogged(name);
		obj.cancel = !x;
	}

	function noChat(name, obj) {
		var x = isLogged(name);
		if (x) obj.cancel = false;
		else {
			if (obj.message.startsWith('/login') || obj.message.startsWith('/register')) obj.cancel = false;
			else obj.cancel = true;
		}
	}

	server.on('player-move-0', (player, data) => cancel(player.id, data));
	server.on('player-invclick-0', (player, data) => cancel(player.id, data));
	server.on('player-blockplace-0', (player, data) => cancel(player.id, data));
	server.on('player-blockbreak-0', (player, data) => cancel(player.id, data));
	server.on('player-message-0', (player, data) => noChat(player.id, data));

	server.on('player-remove', (player) => {
		sessions[player.id] = null;
		delete sessions[player.id];
	});

	server.on('player-join', (player) => {
		setTimeout(() => {
			if (playerdata[player.id] == undefined) {
				player.send([new chat.ChatComponent('Register with: ', 'yellow'), new chat.ChatComponent('/register [password] [password]', '#ffde82')]);
			} else {
				player.send([new chat.ChatComponent('Login with: ', 'yellow'), new chat.ChatComponent('/login [password]', '#ffde82')]);
			}
		}, 2000);
	});

	async function register(executor, arg) {
		if (executor.name == '#console') {
			executor.log([new chat.ChatComponent("Console can't use this command!", 'red')]);
			return;
		}

		if (playerdata[executor.id] == undefined) {
			if (arg[0] == arg[1]) {
				sessions[executor.id] = true;
				playerdata[executor.id] = arg[0];

				executor.send([new chat.ChatComponent('Successfully registered!', 'green')]);

				console.log('Player ' + executor.nickname + ' has been registered!');
				saveDatabase();
			} else {
				executor.send([new chat.ChatComponent('Usage: /register [password] [password]', 'orange')]);
			}
		} else {
			executor.send([new chat.ChatComponent('You are already registered!', '#ff3333')]);
		}
	}

	async function login(executor, arg) {
		if (executor.name == '#console') {
			executor.log([new chat.ChatComponent("Console can't use this command!", 'red')]);
			return;
		}

		if (!sessions[executor.id]) {
			if (playerdata[executor.id] != undefined) {
				if (arg[0] == playerdata[executor.id]) {
					sessions[executor.id] = true;

					executor.send([new chat.ChatComponent('Logged in!', 'green')]);

					console.log('Player ' + executor.nickname + ' logged in!');
				} else {
					executor.send([new chat.ChatComponent('Wrong password!', 'red')]);
				}
			} else {
				executor.send([new chat.ChatComponent('You need to register first!', 'red')]);
			}
		} else {
			executor.send([new chat.ChatComponent('You are already logged in!', 'red')]);
		}
	}

	server.registry.addCommand(new Command('/register', register, 'Registers player'));
	server.registry.addCommand(new Command('/login', login, 'Logs player in'));
};
