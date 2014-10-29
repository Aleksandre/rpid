module.exports = UIManager;

var config = require('./config.js');
var spawn = require('child_process').spawn;
var fs = require('fs');
var path = require('path');
var winston = require('winston');


function UIManager(options) {
	options = options || {};
};

UIManager.prototype = {

	allCommands: {
		'show': 'show',
		'hide': 'hide',
		'stop': 'stop',
		'restart': 'restart'
	},

	start: function () {
		this.show();
	},

	show: function () {
		this.sendCommandToUI(this.allCommands.show);
	},

	hide: function () {
		this.sendCommandToUI(this.allCommands.hide);
	},

	stop: function () {
		this.sendCommandToUI(this.allCommands.stop);
	},

	restart: function () {
		this.sendCommandToUI(this.allCommands.restart);
	},

	dispose: function () {
		this.stop();
	},

	sendCommandToUI: function (cmd) {
		if (this.ls) {
			winston.info('UIManager is sending cmd <%s> to the UI', cmd);
			this.ls.stdin.write(cmd);
		} else {
			winston.info('UIManager dit not send empty command to the UI', cmd);
		}
	},

	launchUI: function () {
		var appDir = path.dirname(require.main.filename);
		var uiExecutablePath = appDir + config.ui.uiExecutablePath;
		winston.info('UIManager is launching python UI executable <%s> in env <%s>', uiExecutablePath, process.env.NODE_ENV);

		this.ls = spawn(config.ui.pythonVMPath, [uiExecutablePath, process.env.NODE_ENV]);

		this.ls.stdout.on('data', function (data) {
			winston.info('UI-PYTHON: ' + data);
		});

		this.ls.stderr.on('data', function (data) {
			winston.info('UI-PYTHON: ' + data);
		});

		this.ls.on('exit', function (code) {
			winston.info('UI-PYTHON: pprocess exited with exit code ' + code);
		});
	},

	killUI: function () {
		if (this.ls) {
			winston.info('UIManager is killing the python UI child process');
			this.ls.kill();
		} else {
			winston.info('UIManager could not kill the python  UI process because it is not running');
		}
	}
}

