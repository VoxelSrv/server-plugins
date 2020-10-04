export const name = 'MConnect';
export const version = '0.0.1';
export const supported = '>=0.2.0-beta.6';

//
// Requires: minecraft-protocol, prismarine-chunk
//

import { getServerInstance } from '../../src/server';
import { BaseSocket } from '../../src/socket';
import * as configs from 'server/configs';
import { serverProtocol } from 'server/values';
import { get as getPlayer } from 'server/players';
import { EventEmitter } from 'events';

import { createServer, Client } from 'minecraft-protocol';
import { Vec3 } from 'vec3';
const Chunk = require('prismarine-chunk')('1.16');

import { defaultWorldData, defaultConfig } from './values';

import { IChatMessage, ILoginSuccess, IPlayerEntity, IPlayerKick, IWorldChunkLoad, IWorldChunkUnload } from 'voxelsrv-protocol/js/server';
import { Player } from 'server/players';

const cfg = { ...defaultConfig, ...configs.load('mconnect', 'config') };

const server = getServerInstance();

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

	client.write('login', {
		entityId: client.uuid,
		levelType: 'default',
		gameMode: 0,
		previousGameMode: 255,
		worldNames: ['minecraft:overworld'],
		dimensionCodec: { name: '', type: 'compound', value: { dimension: { type: 'list', value: { type: 'compound', value: [defaultWorldData] } } } },
		dimension: 'minecraft:overworld',
		worldName: 'minecraft:overworld',
		difficulty: 0,
		hashedSeed: [0, 0],
		maxPlayers: 10,
		reducedDebugInfo: false,
		enableRespawnScreen: false,
	});

	client.on('chat', (msg: IChatMessage) => {
		socket.emit('ActionMessage', { message: msg.message });
	});

	//client.on('packet', (data, packet));
	client.on('end', () => socket.close());

	let ignoreEntity = '';

	socket.client.on('PlayerEntity', function (data: IPlayerEntity) {
		ignoreEntity = data.uuid;
	});

	socket.client.on('WorldChunkLoad', async (data: IWorldChunkLoad) => {
		const chunk = await player.world.getChunk([data.x, data.z], false);

		const mchunk1 = new Chunk();
		const mchunk2 = new Chunk();
		const mchunk3 = new Chunk();
		const mchunk4 = new Chunk();


		for (var x = 0; x < 16; x++) {
			for (var z = 0; z < 16; z++) {
				for (var y = 0; y < 256; y++) {
					mchunk1.setBlockType(new Vec3(x, y, z), chunk.data.get(x, y, z));
					mchunk1.setSkyLight(new Vec3(x, y, z), 15);

					mchunk2.setBlockType(new Vec3(x, y, z), chunk.data.get(x + 16, y, z));
					mchunk2.setSkyLight(new Vec3(x, y, z), 15);

					mchunk3.setBlockType(new Vec3(x, y, z), chunk.data.get(x, y, z + 16));
					mchunk3.setSkyLight(new Vec3(x, y, z), 15);

					mchunk4.setBlockType(new Vec3(x, y, z), chunk.data.get(x + 16, y, z + 16));
					mchunk4.setSkyLight(new Vec3(x, y, z), 15);
				}
			}
		}

		client.write('map_chunk', {
			x: data.x * 2 - 1,
			z: data.z * 2 - 1,
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

		client.write('map_chunk', {
			x: data.x * 2,
			z: data.z * 2 - 1,
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

		client.write('map_chunk', {
			x: data.x * 2 - 1,
			z: data.z * 2,
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

		client.write('map_chunk', {
			x: data.x * 2,
			z: data.z * 2,
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


	});

	socket.client.on('WorldChunkUnload', (data: IWorldChunkUnload) => {
		client.write('unload_chunk', {x: data.x * 2 - 1, z: data.z * 2 - 1})
		client.write('unload_chunk', {x: data.x * 2 - 1, z: data.z * 2})
		client.write('unload_chunk', {x: data.x * 2, z: data.z * 2 - 1})
		client.write('unload_chunk', {x: data.x * 2, z: data.z * 2})

	});

	socket.client.on('PlayerKick', function (data: IPlayerKick) {});

	socket.client.on('LoginSuccess', function (dataPlayer: ILoginSuccess) {
		client.write('position', {
			x: dataPlayer.xPos,
			y: dataPlayer.yPos,
			z: dataPlayer.zPos,
			yaw: 0,
			pitch: 0,
			flags: 0x00,
		});

		player = getPlayer(client.username.toLowerCase());
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
