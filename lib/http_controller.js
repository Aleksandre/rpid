module.exports = AppController;

var winston = require('winston');
var Player = require("./player.js").getPlayer();

/**
 * The AppController transmits requests received by the <http_service> to
 * an instance of <player>
 * @param options
 */
function AppController(options) {
  winston.info("AppController is initializing");
  options = options || {};
  this.player = options.player || new Player();
}

AppController.prototype = {

  index: function (req, res)  {
    this.getApplicationState(req, res);
  },

  getApplicationState: function (req, res)  {
    var state = this.player.getState();
    res.status(200).send(this.player.getState());
  },

  getPlayerState: function (req, res)  {
    var state = this.player.getState();
    res.status(200).send(this.player.getState());
  },

  start: function (req, res)  {
    function cb(result) {
      this._respond(res, result);
    };
    this.player.play(null, cb.bind(this));
  },

  stop: function (req, res)  {
    function cb(result) {
      this._respond(res, result);
    };
    this.player.stop(cb.bind(this));
  },

  pause: function (req, res)  {
    function cb(result) {
      this._respond(res, result);
    };
    this.player.pause(cb.bind(this));
  },

  resume: function (req, res)  {
    function cb(result) {
      this._respond(res, result);
    };
    this.player.resume(cb.bind(this));
  },

  play: function (req, res) {
    function cb(result) {
      this._respond(res, result);
    };
    if ('itemURL' in req.body) {
      var items = req.body['itemURL'];
      if (items instanceof Array || typeof items === "string") {
        winston.info('AppController is playing <%d> media files', items.length);
        this.player.play(items, cb.bind(this));
      } else {
        var msg = 'The item parameter argument must be a string or an Array of media URL';
        this._respond(res, new Error(msg))
      }
    } else  {
      this.player.play(null, cb.bind(this));
    }
  },

  addToPlaylist: function (req, res) {
    if ('itemURL' in req.body) {
      winston.info('AppController is handling addToPlaylist request: <%s>', req.body.itemURL);
      var items = req.body['itemURL'];
      if (items instanceof Array) {
        this.player.addItemsToPlaylist(items);
        this._respond(res, this.player.getState());
      } else if (typeof items === "string") {
        this.player.addItemToPlaylist(items);
        res.status(200).send(this.player.getState());
      } else {
        res.status(400).send('The item parameter argument must be a string or an Array of media URL');
      }
    } else  {
      this._respondWithError(res, {
        message: 'The itemURL parameter was not specified'
      });
    }
  },

  getPlaylist: function (req, res) {
    res.status(200).send(this.player.playlist);
  },

  clearPlaylist: function (req, res)  {
    this.player.clearPlaylist();
    res.status(200).send(this.player.getState());
  },

  playNext: function (req, res)  {
    function cb(result) {
      this._respond(res, result);
    };
    this.player.playNext(cb.bind(this));
  },

  playPrevious: function (req, res)  {
    function cb(result) {
      this._respond(res, result);
    }
    this.player.playPrevious(cb.bind(this));
  },

  volumeUp: function (req, res)  {
    function cb(result) {
      this._respond(res, result);
    }
    this.player.volumeUp(cb);
  },

  volumeDown: function (req, res)  {
    function cb(result) {
      this._respond(res, result);
    }
    this.player.volumeDown(cb);
  },

  _respond: function (res, result) {
    winston.info(result);
    if (result instanceof Error) {
      return this._respondWithError(res, result);
    } else  {
      return this._respondWithSuccess(res, result);
    }
  },

  _respondWithSuccess: function (res, result) {
    winston.info('Reponding with success');
    res.status(200).send(this.player.getState());
  },

  _respondWithError: function (res, error) {
    winston.info('An error occured while handling the request');
    var message = error.message || '';
    var stack = error.stack || '';
    var response = {
      'result': 'The server failed to handle the request',
      error_message: message,
      server_state: this.player.getState(),
      stack: stack
    };
    res.status(400).send(response);
  }
};