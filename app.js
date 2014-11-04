/*!
 * RPID - Raspberry Pi Deamon.
 *
 * Copyright(c) 2014 Aleksandre Clavet
 * MIT Licensed
 *
 * This script will start an HTTP service (./lib/http_service.js)
 * that will listen for requests destined to a media player
 * process (.lib/player_*.js)
 *
 * You can send JSON requests to this service to control
 * the playback of music or videos files on a local or
 * remote system.
 *
 * Before running this script, you should:
 *
 * 1. Install Node.js
 * 2. Install grunt globally: npm install -g grunt
 * 2. Install dependencies: npm install
 *
 * To run this script, use one of these commands:
 *
 * 1. npm run
 * 2. grunt run
 * 3. nodejs app.js
 */

/**
 * Module dependencies.
 */

var config = require("./lib/config.js");
var winston = require('winston');
var MainApp = new require('./lib/app.js');

/*
 * Configure login
 */

var consoleOptions = {
	'colorize': true,
	'timestamp': true,
	timestamp: function () {
		return new Date();
	}
}
winston.remove(winston.transports.Console);
winston.add(winston.transports.Console, consoleOptions);

/**
 *  Set the process name so that you can <pkill rpid-service>
 */

process.title = 'rpid-service';

/**
 * Init server options
 */

var serverOptions = {
	"httpServerPort": config.httpServer.port || 8080,
	"httpServerIP": config.httpServer.IP || '127.0.0.1'
};

/**
 * Start the application
 */
var app = new MainApp(serverOptions);
app.start();