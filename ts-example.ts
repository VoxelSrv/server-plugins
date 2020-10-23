import { Command } from '../src/lib/registry';
import type { Server } from '../src/server';

export const name = 'Typescript';
export const version = '0.0.1';
export const supported = '>=0.2.0-alpha';

export function _start(server: Server) {
	
	function testCommand(executor: any, arg: Array<string>) {
		executor.send('It works!');
	}

	server.registry.addCommand(new Command('/ts', testCommand, 'Test typescript plugin'));
}
