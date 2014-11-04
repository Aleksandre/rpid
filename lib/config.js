var config = {

	httpServer: {
		IP: "127.0.0.1",
		port: 3000
	},

	ui: {
		width: 640,
		heigth: 800,
		fullscreen: false,
		showLog: true,
		pipeFile: "/tmp/rpid-io-pipe"
	},

	players: {
		development: 'base',
		production: 'mplayer'
	}
};

module.exports = config;