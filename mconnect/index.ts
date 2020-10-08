export const name = 'MConnect';
export const version = '0.0.6';
export const supported = '>=0.2.0-beta.6';

//
// Requires: minecraft-protocol, prismarine-chunk
//

import { getServerInstance } from '../../src/server';
import { BaseSocket } from '../../src/socket';
import * as configs from 'server/configs';
import { serverConfig, serverProtocol, serverVersion } from 'server/values';
import { get as getPlayer } from 'server/players';
import { event as registryEvent } from 'server/registry';
import { EventEmitter } from 'events';

import { createServer, Client } from 'minecraft-protocol';
import { Vec3 } from 'vec3';
const Chunk = require('prismarine-chunk')('1.16');
const mcData = require('minecraft-data')('1.16');

import ndarray = require('ndarray');

import { defaultWorldData, defaultConfig } from './values';
import { blockMappings } from './mappings';

import {
	IChatMessage,
	ILoginSuccess,
	IPlayerEntity,
	IPlayerKick,
	IPlayerTeleport,
	IWorldBlockUpdate,
	IWorldChunkLoad,
	IWorldChunkUnload,
} from 'voxelsrv-protocol/js/server';
import { Player } from 'server/players';

const cfg = { ...defaultConfig, ...configs.load('mconnect', 'config') };
configs.save('mconnect', 'config', cfg);

let blockPalette = {};

const server = getServerInstance();

const degToRad = 0.01745329252;

registryEvent.on('palette-finished', (palette) => {
	Object.entries(palette).forEach((x: [string, number]) => {
		let id: string = '';

		if (Array.isArray(blockMappings[x[0]])) id = blockMappings[x[0]][0];
		else id = blockMappings[x[0]];
		if (mcData.blocksByName[id] != undefined) {
			let state = Array.isArray(blockMappings[x[0]]) ? blockMappings[x[0]][1] : 0;
			blockPalette[x[1]] = [mcData.blocksByName[id].id, state];
		} else blockPalette[x[1]] = [1, 0];
	});
});

class MCSocket extends BaseSocket {
	socket: Client;
	client: EventEmitter;
	constructor(client: Client) {
		super();
		this.socket = client;
		this.client = new EventEmitter();
	}

	send(type: string, data: Object) {
		this.client.emit(type, data);
	}

	close() {
		this.emit('close', true);
		this.listeners = {};
	}

	emit(type, data) {
		if (this.listeners[type] != undefined) {
			this.listeners[type].forEach((func) => {
				func(data);
			});
		}
	}
}

const mcserver = createServer(cfg);

mcserver.on('login', (client) => {
	const socket = new MCSocket(client);

	server.connectPlayer(socket);
	let player: Player;
	let playerChunk: string = '';

	client.write('login', {
		entityId: client.uuid,
		levelType: 'default',
		gameMode: 1,
		previousGameMode: 255,
		worldNames: ['minecraft:overworld'],
		dimensionCodec: { name: '', type: 'compound', value: { dimension: { type: 'list', value: { type: 'compound', value: [defaultWorldData] } } } },
		dimension: 'minecraft:overworld',
		worldName: 'minecraft:overworld',
		difficulty: 0,
		hashedSeed: [0, 0],
		viewDistance: serverConfig.viewDistance * 2 + 2,
		maxPlayers: 10,
		reducedDebugInfo: false,
		enableRespawnScreen: false,
		isDebug: false,
		isFlat: false,
	});

	//client.on('packet', (data, packet));
	client.on('end', () => socket.close());

	let ignoreEntity = '';

	socket.client.on('PlayerEntity', function (data: IPlayerEntity) {
		ignoreEntity = data.uuid;
	});

	socket.client.on('WorldBlockUpdate', function (data: IWorldBlockUpdate) {
		client.write('block_change', {
			location: {
				x: data.x,
				y: data.y,
				z: -1 * data.z,
			},
			type: blockPalette[data.id][0],
		});
	});

	socket.client.on('PlayerTeleport', function (data: IPlayerTeleport) {
		client.write('position', {
			x: data.x,
			y: data.y,
			z: -1 * data.z,
			yaw: 0,
			pitch: 0,
			flags: 0x00,
		});
	});

	socket.client.on('WorldChunkLoad', async (data: IWorldChunkLoad) => {
		const chunk = new ndarray(new Uint16Array(data.data), [32, 256, 32]);

		const mchunk1 = new Chunk();
		const mchunk2 = new Chunk();
		const mchunk3 = new Chunk();
		const mchunk4 = new Chunk();

		for (var x = 0; x < 16; x++) {
			for (var z = 0; z < 16; z++) {
				for (var y = 0; y < 256; y++) {
					const vec = new Vec3(x, y, 15 - z);
					mchunk1.setBlockType(vec, blockPalette[chunk.get(x, y, z)][0]);
					mchunk1.setBlockStateId(vec, mcData.blocksByStateId[mchunk1.getBlockStateId(vec)].minStateId + blockPalette[chunk.get(x, y, z)][1]);
					mchunk1.setSkyLight(vec, 15);

					mchunk2.setBlockType(vec, blockPalette[chunk.get(x + 16, y, z)][0]);
					mchunk2.setBlockStateId(vec, mcData.blocksByStateId[mchunk2.getBlockStateId(vec)].minStateId + blockPalette[chunk.get(x + 16, y, z)][1]);
					mchunk2.setSkyLight(vec, 15);

					mchunk3.setBlockType(vec, blockPalette[chunk.get(x, y, z + 16)][0]);
					mchunk3.setBlockStateId(vec, mcData.blocksByStateId[mchunk3.getBlockStateId(vec)].minStateId + blockPalette[chunk.get(x, y, z + 16)][1]);
					mchunk3.setSkyLight(vec, 15);

					mchunk4.setBlockType(vec, blockPalette[chunk.get(x + 16, y, z + 16)][0]);
					mchunk4.setBlockStateId(
						vec,
						mcData.blocksByStateId[mchunk4.getBlockStateId(vec)].minStateId + blockPalette[chunk.get(x + 16, y, z + 16)][1]
					);
					mchunk4.setSkyLight(vec, 15);
				}
			}
		}

		setTimeout(() => {
			client.write('map_chunk', {
				x: data.x * 2,
				z: -1 * (data.z * 2) - 1,
				groundUp: true,
				bitMap: mchunk1.getMask(),
				biomes: mchunk1.dumpBiomes(),
				ignoreOldData: true, // should be false when a chunk section is updated instead of the whole chunk being overwritten, do we ever do that?
				heightmaps: {
					type: 'compound',
					name: '',
					value: {
						MOTION_BLOCKING: { type: 'longArray', value: new Array(36).fill([0, 0]) },
					},
				},
				chunkData: mchunk1.dump(),
				blockEntities: [],
			});
		}, 50);
		setTimeout(() => {
			client.write('map_chunk', {
				x: data.x * 2 + 1,
				z: -1 * (data.z * 2) - 1,
				groundUp: true,
				bitMap: mchunk2.getMask(),
				biomes: mchunk2.dumpBiomes(),
				ignoreOldData: true, // should be false when a chunk section is updated instead of the whole chunk being overwritten, do we ever do that?
				heightmaps: {
					type: 'compound',
					name: '',
					value: {
						MOTION_BLOCKING: { type: 'longArray', value: new Array(36).fill([0, 0]) },
					},
				},
				chunkData: mchunk2.dump(),
				blockEntities: [],
			});
		}, 100);

		setTimeout(() => {
			client.write('map_chunk', {
				x: data.x * 2,
				z: -1 * (data.z * 2 + 1) - 1,
				groundUp: true,
				bitMap: mchunk3.getMask(),
				biomes: mchunk3.dumpBiomes(),
				ignoreOldData: true, // should be false when a chunk section is updated instead of the whole chunk being overwritten, do we ever do that?
				heightmaps: {
					type: 'compound',
					name: '',
					value: {
						MOTION_BLOCKING: { type: 'longArray', value: new Array(36).fill([0, 0]) },
					},
				},
				chunkData: mchunk3.dump(),
				blockEntities: [],
			});
		}, 150);

		setTimeout(() => {
			client.write('map_chunk', {
				x: data.x * 2 + 1,
				z: -1 * (data.z * 2 + 1) - 1,
				groundUp: true,
				bitMap: mchunk4.getMask(),
				biomes: mchunk4.dumpBiomes(),
				ignoreOldData: true, // should be false when a chunk section is updated instead of the whole chunk being overwritten, do we ever do that?
				heightmaps: {
					type: 'compound',
					name: '',
					value: {
						MOTION_BLOCKING: { type: 'longArray', value: new Array(36).fill([0, 0]) },
					},
				},
				chunkData: mchunk4.dump(),
				blockEntities: [],
			});
		}, 200);
	});

	socket.client.on('WorldChunkUnload', (data: IWorldChunkUnload) => {
		client.write('unload_chunk', { chunkX: data.x * 2, chunkZ: -1 * (data.z * 2) - 1 });
		client.write('unload_chunk', { chunkX: data.x * 2, chunkZ: -1 * (data.z * 2 + 1) - 1 });
		client.write('unload_chunk', { chunkX: data.x * 2 + 1, chunkZ: -1 * (data.z * 2) - 1 });
		client.write('unload_chunk', { chunkX: data.x * 2 + 1, chunkZ: -1 * (data.z * 2 + 1) - 1 });
	});

	socket.client.on('PlayerKick', function (data: IPlayerKick) {});

	socket.client.on('LoginSuccess', function (dataPlayer: ILoginSuccess) {
		console.log(`Player ${client.username} connected with Minecraft Client`);
		player = getPlayer(client.username.toLowerCase());

		client.write('position', {
			x: dataPlayer.xPos,
			y: dataPlayer.yPos,
			z: -1 * dataPlayer.zPos,
			yaw: 0,
			pitch: 0,
			flags: 0x00,
		});

		client.write('set_slot', {
			windowId: 0,
			slot: 6,
			item: { present: true, blockId: 296, itemCount: 32 },
		});

		client.write('update_view_position', {
			chunkX: player.entity.chunkID[0] * 2,
			chunkZ: -1 * player.entity.chunkID[1] * 2,
		});

		client.registerChannel('brand', ['string', []]);
		client.writeChannel('brand', `VoxelSrv-Server ${serverVersion} [MConnect ${version}]`);

		client.on('chat', (msg) => {
			socket.emit('ActionMessage', { message: msg.message });
		});

		client.on('block_place', (msg) => {
			let x = msg.location.x,
				y = msg.location.y,
				z = msg.location.z;

			if (msg.cursorY == 1) y = y + 1;
			else if (msg.cursorY == 0) y = y - 1;
			else if (msg.cursorX == 1) x = x + 1;
			else if (msg.cursorX == 0) x = x - 1;
			else if (msg.cursorZ == 1) z = z + 1;
			else if (msg.cursorZ == 0) z = z - 1;

			socket.emit('ActionBlockPlace', { x, y, z: -1 * z, x2: msg.location.x, y2: msg.location.y, z2: -1 * msg.location.z });
		});

		client.on('block_dig', (msg) => {
			socket.emit('ActionBlockBreak', { x: msg.location.x, y: msg.location.y, z: -1 * msg.location.z });
		});

		let pos = { x: dataPlayer.xPos, y: dataPlayer.yPos, z: dataPlayer.zPos };
		let yaw = 0;
		let pitch = 0;

		client.on('position', (msg) => {
			socket.emit('ActionMove', { x: msg.x, y: msg.y, z: -1 * msg.z + 1, rotation: yaw, pitch: pitch });
			pos = { x: msg.x, y: msg.y, z: -1 * msg.z + 1 };

			if (playerChunk != player.entity.chunkID.toString()) {
				playerChunk = player.entity.chunkID.toString();
				client.write('update_view_position', {
					chunkX: player.entity.chunkID[0] * 2,
					chunkZ: -1 * player.entity.chunkID[1] * 2,
				});
			}
		});

		client.on('look', (msg) => {
			yaw = msg.yaw * degToRad * -1;
			pitch = msg.pitch * degToRad * -1;

			socket.emit('ActionMove', {
				x: pos.x,
				y: pos.y,
				z: pos.z,
				rotation: yaw,
				pitch: pitch,
			});
		});
	});

	socket.client.on('ChatMessage', function (data) {
		let msg = JSON.stringify({
			text: '',
			extra: data.message,
		});
		let tempmsg = '';

		while (msg != tempmsg) {
			tempmsg = msg;
			msg = msg.replace(',"font":"lato"', '');
			msg = msg.replace(',"font":"lato-bold"', '');
		}

		client.write('chat', {
			message: msg,
			position: 0,
			sender: '0',
		});
	});

	client.on('error', (e) => console.error(client.username, e));

	socket.emit('LoginResponse', {
		username: client.username,
		protocol: serverProtocol,
		mobile: false,
	});
});

mcserver.on('error', (e) => console.error(e));
