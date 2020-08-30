module.exports = {
	name: 'Welcome',
	version: '0.0.2',
	supports: '>=0.2.0-alpha.4'
}

const { players, configs } = require('server')

const cfg = [...configs]
configs.save('', 'welcome')


players.event.on('create', function(player) {
	setTimeout(function() {
		cfg.forEach(function(text) { 
			player.send(data.id, text)
		})
	}, 500)
})