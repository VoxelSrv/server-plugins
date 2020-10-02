import * as players from 'server/players';
import { ChatComponent } from 'server/chat';

export const name = 'PlayerList';
export const version = '0.0.1';
export const supported = '>=0.2.0-beta.6';

function updateTab() {
	const allPlayers = Object.values(players.getAll());

	let tab: ChatComponent[] = [new ChatComponent('\n', 'white', 'Lato', false, false)];

	allPlayers.forEach((player) => {
		tab.push(new ChatComponent(player.displayName + '\n', 'white', 'Lato', false, false));
	});

	allPlayers.forEach((player) => player.setTab(tab));
}

players.event.on('player-join', () => {
	updateTab();
	setTimeout( ()=>{updateTab()}, 1000)
	
});

players.event.on('player-remove', () => {
	updateTab();
});
