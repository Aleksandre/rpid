module.exports = MainApp;

var HttpService = require('./http_service.js');
var Player = require('./player.js').getPlayer();
var winston = require('winston');

function MainApp(options) {
	options = options || {};
	this.loadServices(options);
	this.bindEvents();
};

MainApp.prototype = {

	loadServices: function (options) {
		this.services = [];
		this.services.push(new HttpService(options));
		this.services.push(new Player(options));
		this.bindEvents();
	},

	bindEvents: function () {
		process.on('SIGINT', this.stop.bind(this));
	},

	unloadServices: function () {
		winston.info('MainApp is loading services');
		this.services.forEach((function (service) {
			service.dispose();
		}).bind(this));
	},

	start: function () {
		winston.info('MainApp is starting services');
		this.services.forEach((function (service) {
			service.start();
		}).bind(this));
	},

	stop: function () {
		winston.info('MainApp is stopping services');
		this.services.forEach(function (service) {
			service.dispose();
		});
		process.exit();
	}
};