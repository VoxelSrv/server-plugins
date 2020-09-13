import { blockRegistry, Block } from 'server/registry';
import { World } from 'server/worlds';
import { XYZ } from '../../src/types';
import { sendPacketAll } from 'server/players';

export function set(p1: XYZ, p2: XYZ, world: World, block: Block[] | Block) {
	let getBlock = (): Block => {
		return blockRegistry['air'];
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

	console.log(x1, y1, z1, x2, y2, z2)

	for (let x = x1; x <= x2; x++) {
		for (let y = y1; y <= y2; y++) {
			for (let z = z1; z <= z2; z++) {
				const b = getBlock();
				world.setBlock([x, y, z], b, true);
				sendPacketAll('WorldBlockUpdate', { x, y, z, id: b.rawid });
			}
		}
	}
}
