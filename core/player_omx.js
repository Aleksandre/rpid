var omx = require('omxdirector');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var winston = require('winston');
var BasePlayer = new require('./player.js').BasePlayer;

function PlayerOmxDirector(options) {
	winston.info("BasePlayer is initializing");
	options = options || {};

	this.queue = options.queue || [];
	this.queueCurrentIdx = options.queueCurrentIdx || 0;
	this.state = options.state || this.allStates.Waiting;
	this.currentMedia = '';
	this.watcherID = -1;

	this.bindEvents();
}

PlayerOmxDirector.prototype = {

	__proto__: BasePlayer.prototype,

	constructor: PlayerOmxDirector,

	name: "OmxDirectorPlayer",

	allCommands: {
		'play': omx.play,
		'stop': omx.stop,
		'pause': omx.pause,
		'resume': omx.resume,
		'volup': omx.volup,
		'voldown': omx.voldown
	},

	bindEvents: function () {
		winston.info('%s is binding to OMXDirector events', this.name);
		omx.on('load', this.onLoaded.bind(this));
		omx.on('stop', this.onStopped.bind(this));
		omx.on('play', this.onStartedPlaying.bind(this));
		omx.on('pause', this.onPaused.bind(this));
	},

	unbindEvents: function () {
		omx.off('load');
		omx.off('stop');
		omx.off('play');
		omx.off('pause');
	},

	getState: function () {
		var state = {
			"player_impl": 'OmxDirectorPlayer',
			"player_state": this.state,
			"currently_playing_media": this.getCurrentMedia(),
			"queue_length": this.queue.length,
			"queue_item_position": function () {
				if (this.queue.length === 0) return 0;
				else return this.queueCurrentIdx + 1;
			},
			"queue_content": this.queue,
			"state_omx": this._getThirdPartyPlayerState()
		};
		winston.info("%s is returning it's current state: <%s>", this.name, state);
		return state;
	},

	_watchThirdPartyPlayer: function () {
		this.watcherID = setInterval((function () {
			var state = this._getThirdPartyPlayerState();
			if (state && 'loaded' in state && !state.loaded) {
				if (this.state !== this.allStates.Stopped && this.state !== this.allStates.Waiting) {
					winston.info("%s._watchThirdPartyPlayer detected that the player has stopped playing something", this.name);
					eventEmitter.emit(this.allEvents.onPlayerStopped);
				}
				this.state = this.allStates.Stopped;
			}
		}).bind(this), 1000);
	},

	_stopWatchingThirdPartyPlayer: function () {
		if (this.watcherID !== -1) {
			clearInterval(this.watcherID);
			this.watcherID = -1;
		}
	},

	_play: function (mediaURL) {
		if (mediaURL) {
			winston.info('%s has sent a play request for file <%s> to omxdirector', this.name, mediaURL);
			this.currentMedia = mediaURL;
			this._sendCmdToThirdPartyPlayer(omx.play, this.currentMedia);
		} else {
			winston.info('%s failed to play a media with an empty URL', this.name);
		}
	},

	_sendCmdToThirdPartyPlayer: function (cmd, args) {
		args = args || null;
		if (typeof (cmd) === "function") {
			try {
				cmd(args);
			} catch (err) {
				winston.error('OMXDirector has thrown an exception: <%s>', err);
			}
		} else {
			winston.info('%s could not call the cmd variable because it is not a function', this.name);
		}
	}
};

module.exports = PlayerOmxDirector;