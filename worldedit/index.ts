import { commands, worlds, players, registry } from 'server';
import { ChatComponent } from 'server/chat';
import { Player } from 'server/players';

import * as api from './api';

export const name = 'WorldEdit';
export const version = '0.0.1';
export const supported = '>=0.2.0-beta.3.1';
export function getAPI() {
	return api
}

const storage = {};

registry.event.on('registry-define', () => {
	const wand = new registry.ItemTool('we:wand', 'WorldEdit Tool', 'item/totem_of_undying', 'worldedit', Infinity, -1, -1);
	registry.addItem(wand);
});

players.event.on('player-join', (player) => {
	storage[player.id] = { p1: [0, 0, 0], p2: [0, 0, 0] };
});

players.event.on('player-remove', (player) => {
	delete storage[player.id];
});

players.event.on('player-blockbreak-1', (player: players.Player, data) => {
	if (player.inventory.items[player.inventory.selected].id == 'we:wand') {
		data.cancel = true;
	}
});

players.event.on('player-click-4', (player: players.Player, data) => {
	if (!data.onBlock) return;

	if (player.inventory.items[player.inventory.selected].id == 'we:wand') {
		if (data.type == 'left') {
			storage[player.id].p1 = [data.x, data.y, data.z];
			player.send([new ChatComponent(`Pos1 is now set to `, '#00c400'), new ChatComponent(`${data.x}, ${data.y}, ${data.z}`, '#59ff59')]);
		} else if (data.type == 'right') {
			storage[player.id].p2 = [data.x, data.y, data.z];
			player.send([new ChatComponent(`Pos2 is now set to `, '#00c400'), new ChatComponent(`${data.x}, ${data.y}, ${data.z}`, '#59ff59')]);
		}
	}
});


function setCommand(executor: Player, args) {
	if (executor.id == '#console') return;

	const id = executor.id
	if (executor.permissions.check('worldedit.set') || true) {
		const block = registry.blockRegistry[args[0]]
		if (block == undefined) {
			executor.send([new ChatComponent(`Invalid block! ${args[0]} doesn't exist!`, 'red')]);
			return;
		}
		api.set(storage[id].p1, storage[id].p2, executor.world, block)
		executor.send([new ChatComponent(`Done!`, '#00c40')]);
		return;
	}
	executor.send([new ChatComponent(`You can't use this command!`, 'red')]);

}

commands.register('/set', setCommand, 'Sets selected region to block.')