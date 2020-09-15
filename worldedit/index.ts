import { commands, worlds, players, registry } from 'server';
import { ChatComponent } from 'server/chat';
import { Player, sendPacketAll } from 'server/players';

import * as api from './api';

export const name = 'WorldEdit';
export const version = '0.0.3';
export const supported = '>=0.2.0-beta.4.1';
export function getAPI() {
	return api;
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

async function setCommand(executor: Player, args) {
	if (executor.id == '#console') return;

	const id = executor.id;
	if (!executor.permissions.check('worldedit.set')) {
		let block;
		if (args[0].includes(',')) {
			block = [];
			args[0].split(',').forEach((e) => block.push(registry.blockRegistry[e]));
		} else block = registry.blockRegistry[args[0]];

		if (block == undefined) {
			executor.send([new ChatComponent(`Invalid block! ${args[0]} doesn't exist!`, 'red')]);
			return;
		}

		api.set(storage[id].p1, storage[id].p2, executor.world, block);
		executor.send([new ChatComponent(`Done!`, '#00c40')]);
		return;
	}

	executor.send([new ChatComponent(`You can't use this command!`, 'red')]);
}
commands.register('/set', setCommand, 'Sets selected region to block.');

async function repCommand(executor: Player, args) {
	if (executor.id == '#console') return;

	const id = executor.id;
	if (!executor.permissions.check('worldedit.replace')) {
		let original;
		if (args[0].includes(',')) {
			original = [];
			args[0].split(',').forEach((e) => original.push(registry.blockRegistry[e]));
		} else original = registry.blockRegistry[args[0]];

		if (original == undefined) {
			executor.send([new ChatComponent(`Invalid block! ${args[0]} doesn't exist!`, 'red')]);
			return;
		}

		let block;
		if (args[1].includes(',')) {
			block = [];
			args[1].split(',').forEach((e) => block.push(registry.blockRegistry[e]));
		} else block = registry.blockRegistry[args[1]];

		if (block == undefined) {
			executor.send([new ChatComponent(`Invalid block! ${args[0]} doesn't exist!`, 'red')]);
			return;
		}

		api.replace(storage[id].p1, storage[id].p2, executor.world, block, original);
		executor.send([new ChatComponent(`Done!`, '#00c40')]);
		return;
	}

	executor.send([new ChatComponent(`You can't use this command!`, 'red')]);
}
commands.register('/replace', repCommand, 'Replaces blocks within region.');
commands.register('/rep', repCommand, 'See /replace');

async function upCommand(executor: Player, args) {
	if (executor.id == '#console') return;

	const id = executor.id;
	if (!executor.permissions.check('worldedit.up')) {
		const pos = executor.entity.data.position;

		let block = 1;

		if (!!registry.blockRegistry['glass']) block = registry.blockRegistry['glass'].rawid;

		if (!!registry.blockRegistry[args[1]]) block = registry.blockRegistry[args[1]].rawid;
		executor.world.setBlock([Math.floor(pos[0]), Math.floor(pos[1]) + parseInt(args[0]), Math.floor(pos[2])], block, false);
		sendPacketAll('WorldBlockUpdate', { x: Math.floor(pos[0]), y: Math.floor(pos[1]) + parseInt(args[0]), z: Math.floor(pos[2]), id: block });
		executor.teleport([pos[0], Math.floor(pos[1]) + parseInt(args[0]) + 1, pos[2]], executor.world)
		executor.send([new ChatComponent(`Done!`, '#00c40')]);
		return;
	}

	executor.send([new ChatComponent(`You can't use this command!`, 'red')]);
}
commands.register('/up', upCommand, 'Creates block above and teleports player to it.');
