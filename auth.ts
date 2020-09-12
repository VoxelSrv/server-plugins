export const name = 'Auth';
export const version = '0.0.2';
export const supported = '>=0.2.0-alpha.4';

import { players, commands, console, chat, configs } from 'server';

const sessions = {};

let playerdata = {};

function saveDatabase() {
	configs.save('storage', 'auth', playerdata);
}

playerdata = configs.load('storage', 'auth');

export function isLogged(name) {
	if (sessions[name] == true) {
		return true;
	} else {
		return false;
	}
}

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

players.event.on('player-move-0', (player, data) => cancel(player.id, data));
players.event.on('player-invclick-0', (player, data) => cancel(player.id, data));
players.event.on('player-blockplace-0', (player, data) => cancel(player.id, data));
players.event.on('player-blockbreak-0', (player, data) => cancel(player.id, data));
players.event.on('player-message-0', (player, data) => noChat(player.id, data));

players.event.on('disconnect', (id) => {
	sessions[id] = null;
	delete sessions[id];
});

players.event.on('connection', (id) => {
	setTimeout(() => {
		var player = players.get(id);
		if (player == undefined) return;

		if (playerdata[id] == undefined) {
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

commands.register('/register', register, 'Registers player');
commands.register('/login', login, 'Logs player in');
