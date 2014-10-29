
// Set process name
process.title = 'rpid';

var winston = require('winston');
var consoleOptions = {
	'colorize': true,
	'timestamp': true,
	timestamp: function () {
		return new Date();
	}
}
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, consoleOptions)

var config = require("./core/config.js");
var MainApp = new require('./core/app.js');

// Init server options
var serverOptions = {
	"httpServerPort": config.httpServer.port || 8080,
	"httpServerIP": config.httpServer.IP || '127.0.0.1'
};

var app = new MainApp(serverOptions);
app.start();