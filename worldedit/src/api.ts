import type { Server } from 'voxelsrv-server/dist/server';
import type { Block, Registry } from 'voxelsrv-server/dist/lib/registry';
import type { World } from 'voxelsrv-server/dist/lib/worlds';

import { XYZ } from 'voxelsrv-server/src/types';

export class API {
	_server: Server;
	_registry: Registry;

	constructor(server: Server) {
		this._server = server;
		this._registry = server.registry;
	}
	set(p1: XYZ, p2: XYZ, world: World, block: Block[] | Block) {
		let getBlock = (): Block => {
			return this._registry.blocks['air'];
		};
		if (Array.isArray(block)) {
			getBlock = () => {
				return block[(Math.random() * block.length) | 0];
			};
		} else
			getBlock = (): Block => {
				return block;
			};

		const x1 = p1[0] >= p2[0] ? p2[0] : p1[0];
		const y1 = p1[1] >= p2[1] ? p2[1] : p1[1];
		const z1 = p1[2] >= p2[2] ? p2[2] : p1[2];

		const x2 = p1[0] >= p2[0] ? p1[0] : p2[0];
		const y2 = p1[1] >= p2[1] ? p1[1] : p2[1];
		const z2 = p1[2] >= p2[2] ? p1[2] : p2[2];

		for (var x = x1; x <= x2; x++) {
			for (var y = y1; y <= y2; y++) {
				for (var z = z1; z <= z2; z++) {
					const b = getBlock();
					world.setBlock([x, y, z], b.numId, true);
					this._server.players.sendPacketAll('WorldBlockUpdate', { x, y, z, id: b.numId });
				}
			}
		}
	}

	replace(p1: XYZ, p2: XYZ, world: World, block: Block[] | Block, org: Block[] | Block) {
		let getBlock = (): Block => {
			return this._registry.blocks['air'];
		};
		if (Array.isArray(block)) {
			getBlock = () => {
				return block[(Math.random() * block.length) | 0];
			};
		} else
			getBlock = (): Block => {
				return block;
			};

		const x1 = p1[0] >= p2[0] ? p2[0] : p1[0];
		const y1 = p1[1] >= p2[1] ? p2[1] : p1[1];
		const z1 = p1[2] >= p2[2] ? p2[2] : p1[2];

		const x2 = p1[0] >= p2[0] ? p1[0] : p2[0];
		const y2 = p1[1] >= p2[1] ? p1[1] : p2[1];
		const z2 = p1[2] >= p2[2] ? p1[2] : p2[2];

		if (Array.isArray(org)) {
			const oObj: any = {};
			org.forEach((o) => (oObj[o.numId] = true));
			for (var x = x1; x <= x2; x++) {
				for (var y = y1; y <= y2; y++) {
					for (var z = z1; z <= z2; z++) {
						const xyz: XYZ = [x, y, z];
						if (!oObj[world.getBlock(xyz, false).numId]) continue;
						const b = getBlock();
						world.setBlock(xyz, b.numId, false);
						this._server.players.sendPacketAll('WorldBlockUpdate', { x, y, z, id: b.numId });
					}
				}
			}
		} else {
			const o = org.numId;
			for (var x = x1; x <= x2; x++) {
				for (var y = y1; y <= y2; y++) {
					for (var z = z1; z <= z2; z++) {
						const xyz: XYZ = [x, y, z];
						if (world.getBlock(xyz, false).numId != o) continue;
						const b = getBlock();
						this._server.players.sendPacketAll('WorldBlockUpdate', { x, y, z, id: b.numId });
						world.setBlock(xyz, b.numId, false);
					}
				}
			}
		}
	}
}
