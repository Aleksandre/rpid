var config = {

	httpServer: {
		IP: "192.168.1.144",
		port: 3000
	},

	ui: {
		width: 640,
		heigth: 800,
		fullscreen: false,
		showLog: true,
		pipeFile: "/tmp/rpid-io-pipe",
	},

	players: {
		development: 'base',
		production: 'omxmanager'
	}
};

module.exports = config;