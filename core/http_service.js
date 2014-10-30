module.exports = HttpService;

var express = require('express');
var connect = require('connect');
var bodyParser = require('body-parser');
var Controller = new require('./app_controller.js');
var winston = require('winston');


function HttpService(options) {
  this.init(options);
  this.registerRoutes();
};


HttpService.prototype = {

  init: function (options) {
    var options = options || {};
    this.httpServerPort = options.httpServerPort;
    this.httpServerIP = options.httpServerIP;
    this.controller = new Controller();
    this.app = express();
    this.server = null; // Set when <start> method is called
    this.configure();
  },

  configure: function () {
    this.app.use(bodyParser.urlencoded());
    this.app.use(bodyParser.json());
    this.app.set('json spaces', 4);
    this.app.use(function (req, res, next) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      return next();
    });
  },

  start: function () {
    winston.info('HttpService is starting from <%s>', __dirname);
    this.server = this.app.listen(this.httpServerPort, this.httpServerIP, (function () {
      winston.info("Express started listening on port <%d> in env <%s>", this.httpServerPort, process.env.NODE_ENV);
    }).bind(this));
  },

  stop: function () {
    if (this.server) {
      winston.info('HttpService is stopping the express server');
      this.server.close();
    } else {
      winston.info('HttpService could not stop the express server because it is not running');
    }
  },

  registerRoutes: function () {
    winston.info('HttpService is registering routes');
    this.app.get('/', this.controller.index.bind(this.controller));
    this.app.get('/state', this.controller.getApplicationState.bind(this.controller));

    this.app.post('/play', this.controller.play.bind(this.controller));
    this.app.post('/play/next', this.controller.playNext.bind(this.controller));
    this.app.post('/play/prev', this.controller.playPrevious.bind(this.controller));

    this.app.post('/stop', this.controller.stop.bind(this.controller));
    this.app.post('/pause', this.controller.pause.bind(this.controller));
    this.app.post('/resume', this.controller.resume.bind(this.controller));

    this.app.post('/playlist/add', this.controller.addToPlaylist.bind(this.controller));
    this.app.post('/playlist/clear', this.controller.clearPlaylist.bind(this.controller));

    this.app.post('/volume/up', this.controller.volumeUp.bind(this.controller));
    this.app.post('/volume/down', this.controller.volumeDown.bind(this.controller));
  }
};