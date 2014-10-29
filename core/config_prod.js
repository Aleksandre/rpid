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
		communicationFullFileName: '.ui-order.json',
		uiExecutablePath: '/ui/main.py',
		pythonVMPath: 'python',
	},

	players: {
		development: './player_omx.js',
		production: './player_omx.js'
	}
};

module.exports = config;