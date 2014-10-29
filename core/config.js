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
		communicationFullFileName: '.ui-order.json',
		uiExecutablePath: '/ui/main.py',
		pythonVMPath: 'python',
	},

	players: {
		development: 'base',
		production: 'omxdirector'
	}
};

module.exports = config;