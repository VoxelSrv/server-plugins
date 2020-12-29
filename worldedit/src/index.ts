import { ChatComponent } from 'voxelsrv-server/dist/lib/chat';
import { Command, ItemTool, Registry } from 'voxelsrv-server/dist/lib/registry';
import type { Server } from 'voxelsrv-server/dist/server';
import type { Player } from 'voxelsrv-server/dist/lib/player';

import { API } from './api';
import { ICorePlugin } from 'voxelservercore/interfaces/plugin';

export class Plugin implements ICorePlugin {
	name = 'WorldEdit';
	version = '0.0.4';
	supportedGameAPI = '>=0.2.0-beta.17';
	game = 'voxelsrv';
	supportedAPI = '0.1.6';
	api: API;
	getAPI() {
		return this.api;
	}

	constructor(server: Server) {
		const storage: { [index: string]: any } = {};

		this.api = new API(server);

		server.on('registry-define', () => {
			const wand = new ItemTool('we:wand', 'WorldEdit Tool', 'item/totem_of_undying', 'worldedit', Infinity, -1, -1);

			// @ts-ignore
			server.registry.addItem(wand);
		});

		server.on('player-join', (player) => {
			storage[player.id] = { p1: [0, 0, 0], p2: [0, 0, 0] };
		});

		server.on('player-remove', (player) => {
			delete storage[player.id];
		});

		server.on('player-blockbreak-1', (player: Player, data) => {
			const sel = player.inventory.selected;
			// @ts-ignore
			if (player.inventory.items[sel].id == 'we:wand') {
				data.cancel = true;
			}
		});

		server.on('player-click-4', (player: Player, data) => {
			if (!data.onBlock) return;
			// @ts-ignore
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

		const setCommand = async (executor: Player, args: any) => {
			if (executor.id == '#console') return;

			const id = executor.id;
			if (executor.permissions.check('worldedit.set')) {
				let block;
				if (args[0].includes(',')) {
					block = [];
					args[0].split(',').forEach((e: string) => block.push(server.registry.blocks[e]));
				} else block = server.registry.blocks[args[0]];

				if (block == undefined) {
					executor.send([new ChatComponent(`Invalid block! ${args[0]} doesn't exist!`, 'red')]);
					return;
				}

				this.api.set(storage[id].p1, storage[id].p2, executor.world, block);
				executor.send([new ChatComponent(`Done!`, '#00c40')]);
				return;
			}

			executor.send([new ChatComponent(`You can't use this command!`, 'red')]);
		};
		server.registry.addCommand(new Command('/set', setCommand, 'Sets selected region to block.'));

		const repCommand = async (executor: Player, args: any) => {
			if (executor.id == '#console') return;

			const id = executor.id;
			if (executor.permissions.check('worldedit.replace')) {
				let original;
				if (args[0].includes(',')) {
					original = [];
					args[0].split(',').forEach((e: string) => original.push(server.registry.blocks[e]));
				} else original = server.registry.blocks[args[0]];

				if (original == undefined) {
					executor.send([new ChatComponent(`Invalid block! ${args[0]} doesn't exist!`, 'red')]);
					return;
				}

				let block;
				if (args[1].includes(',')) {
					block = [];
					args[1].split(',').forEach((e: string) => block.push(server.registry.blocks[e]));
				} else block = server.registry.blocks[args[1]];

				if (block == undefined) {
					executor.send([new ChatComponent(`Invalid block! ${args[0]} doesn't exist!`, 'red')]);
					return;
				}

				this.api.replace(storage[id].p1, storage[id].p2, executor.world, block, original);
				executor.send([new ChatComponent(`Done!`, '#00c40')]);
				return;
			}

			executor.send([new ChatComponent(`You can't use this command!`, 'red')]);
		};
		server.registry.addCommand(new Command('/replace', repCommand, 'Replaces blocks within region.'));
		server.registry.addCommand(new Command('/rep', repCommand, 'See /replace'));

		const upCommand = async (executor: Player, args: any) => {
			if (executor.id == '#console') return;

			const id = executor.id;
			if (executor.permissions.check('worldedit.up')) {
				const pos = executor.entity.data.position;

				let block = 1;

				if (!!server.registry.blocks['glass']) block = server.registry.blocks['glass'].rawid;

				if (!!server.registry.blocks[args[1]]) block = server.registry.blocks[args[1]].rawid;
				executor.world.setBlock([Math.floor(pos[0]), Math.floor(pos[1]) + parseInt(args[0]), Math.floor(pos[2])], block, false);
				server.players.sendPacketAll('WorldBlockUpdate', {
					x: Math.floor(pos[0]),
					y: Math.floor(pos[1]) + parseInt(args[0]),
					z: Math.floor(pos[2]),
					id: block,
				});
				executor.teleport([pos[0], Math.floor(pos[1]) + parseInt(args[0]) + 1, pos[2]], executor.world);
				executor.send([new ChatComponent(`Done!`, '#00c40')]);
				return;
			}

			executor.send([new ChatComponent(`You can't use this command!`, 'red')]);
		};
		server.registry.addCommand(new Command('/up', upCommand, 'Creates block above and teleports player to it.'));
	}
}
