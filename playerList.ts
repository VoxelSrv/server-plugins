import { ChatComponent } from '../src/lib/chat';
import type { Server } from '../src/server';

export const name = 'PlayerList';
export const version = '0.0.2';
export const supported = '>=0.2.0-beta.8';

export function _start(server: Server) {
	function updateTab() {
		const allPlayers = Object.values(server.players.getAll());

		let tab: ChatComponent[] = [new ChatComponent('\n', 'white', 'Lato', false, false)];

		allPlayers.forEach((player) => {
			tab.push(new ChatComponent(player.displayName + '\n', 'white', 'Lato', false, false));
		});

		allPlayers.forEach((player) => player.setTab(tab));
	}

	server.on('player-join', () => {
		updateTab();
		setTimeout(() => {
			updateTab();
		}, 1000);
	});

	server.on('player-remove', () => {
		updateTab();
	});
}
