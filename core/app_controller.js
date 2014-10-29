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
    res.send(state);
  },

  start: function (req, res)  {
    this.player.play();
    res.sendStatus(200);
  },

  stop: function (req, res)  {
    // TODO : CHANGE stop function
    this.player.pause();
    res.sendStatus(200);
  },

  pause: function (req, res)  {
    this.player.pause();
    res.sendStatus(200);
  },

  resume: function (req, res)  {
    this.player.resume();
    res.sendStatus(200);
  },

  play: function (req, res) {
    if ('itemURL' in req.body) {
      var items = req.body['itemURL'];
      if (items instanceof Array || typeof items === "string") {
        this.player.play(items);
        res.sendStatus(200);
      } else {
        res.status(400).send('The item paramter argument must be a string or an Array of media URL');
      }
    } else  {
      var result = this.start();
      return res.status(200).send(player.getState());
    }
  },

  queue: function (req, res) {
    if ('itemURL' in req.body) {
      var items = req.body['itemURL'];
      if (items instanceof Array) {
        this.player.queueItemCollection(items);
        res.sendStatus(200);
      } else if (typeof items === "string") {
        this.player.queueOneItem(items);
        res.sendStatus(200);
      } else {
        res.status(400).send('The item paramter argument must be a string or an Array of media URL');
      }
    } else  {
      res.status(400).send('The itemURL parameter was not specified');
    }
  },

  clearQueue: function (req, res)  {
    this.player.clearQueue();
    res.sendStatus(200);
  },

  playNext: function (req, res)  {
    this.player.playNext();
    res.sendStatus(200);
  },

  playPrevious: function (req, res)  {
    this.player.playPrevious();
    res.sendStatus(200);
  },

  volumeUp: function (req, res)  {
    this.player.volumeUp();
    res.sendStatus(200);
  },

  volumeDown: function (req, res)  {
    this.player.volumeDown();
    res.sendStatus(200);
  }
};