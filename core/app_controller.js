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
    winston.info(this);
    this.getApplicationState(req, res);
  },

  getApplicationState: function (req, res)  {
    var state = this.player.getState();
    res.send(state);
  },

  getPlayerState: function (req, res)  {
    var state = this.player.getState();
    res.status(200).send(this.player.getState());
  },

  start: function (req, res)  {
    this.player.play();
    res.status(200).send(this.player.getState());
  },

  stop: function (req, res)  {
    // TODO : CHANGE stop function
    this.player.pause();
    res.status(200).send(this.player.getState());
  },

  pause: function (req, res)  {
    this.player.pause();
    res.status(200).send(this.player.getState());
  },

  resume: function (req, res)  {
    this.player.resume();
    res.status(200).send(this.player.getState());
  },

  play: function (req, res) {
    if ('itemURL' in req.body) {
      var items = req.body['itemURL'];
      if (items instanceof Array || typeof items === "string") {
        winston.info('AppController is playing <%d> media files', items.length);
        this._sendPlayCmd(items, res);
      } else {
        this._respondWithError(res, {
          message: 'The item parameter argument must be a string or an Array of media URL'
        });
      }
    } else  {
      this._sendPlayCmd(null, res);
    }
  },

  _sendPlayCmd: function (item, res) {
    var result = this.player.play(item);
    if (result instanceof Error) {
      this._respondWithError(res, result);
    } else {
      res.status(200).send(this.player.getState());
    }
  },

  addToPlaylist: function (req, res) {
    if ('itemURL' in req.body) {
      winston.info('AppController is handling addToPlaylist request: <%s>', req.body.itemURL);
      var items = req.body['itemURL'];
      if (items instanceof Array) {
        this.player.addItemsToPlaylist(items);
        res.status(200).send(this.player.getState());
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
    var playlist = this.player.playlist;
    res.status(200).send(playlist);
  },

  clearPlaylist: function (req, res)  {
    var result = this.player.clearPlaylist();
    if (result instanceof Error) {
      this._respondWithError(res, result);
    } else {
      res.status(200).send(this.player.getState());
    }
  },

  playNext: function (req, res)  {
    var result = this.player.playNext();
    if (result instanceof Error) {
      this._respondWithError(res, result);
    } else {
      res.status(200).send(this.player.getState());
    }
  },

  playPrevious: function (req, res)  {
    var result = this.player.playPrevious();
    if (result instanceof Error) {
      this._respondWithError(res, result);
    } else {
      res.status(200).send(this.player.getState());
    }
  },

  volumeUp: function (req, res)  {
    var result = this.player.volumeUp();
    if (result instanceof Error) {
      this._respondWithError(res, result);
    } else {
      res.status(200).send(this.player.getState());
    }
  },

  volumeDown: function (req, res)  {
    var result = this.player.volumeDown();
    if (result instanceof Error) {
      this._respondWithError(res, result);
    } else {
      res.status(200).send(this.player.getState());
    }
  },

  _respondWithError: function (res, error) {
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