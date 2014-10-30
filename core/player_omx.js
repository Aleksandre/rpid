var omx = require('omxdirector');
var events = require('events');
var eventEmitter = new events.EventEmitter();
var winston = require('winston');
var BasePlayer = new require('./player.js').BasePlayer;

var PlayerOmxDirector = BasePlayer;

PlayerOmxDirector.prototype = {

	__proto__: BasePlayer.prototype,

	constructor: BasePlayer,

	init: function (options) {

		this.playerName = "OmxDirectorPlayer";

		this.allCommands = {
			'play': omx.play.bind(this),
			'stop': omx.stop.bind(this),
			'pause': omx.pause.bind(this),
			'resume': omx.play.bind(this),
			'volup': omx.volup.bind(this),
			'voldown': omx.voldown.bind(this)
		};

		this.allStates = {
			'Waiting': 'Waiting',
			'Playing': 'Playing',
			'Paused': 'Paused',
			'Stopped': 'Stopped'
		};

		this.allEvents = {
			'onPlayerStopped': 'onPlayerStopped',
			'onPlayerLoadedMedia': 'onPlayerLoadedMedia',
			'onPlayerStartedPlaying': 'onPlayerStartedPlaying',
			'onPlayerPaused': 'onPlayerPaused'
		};
		this.watcherID = -1;
		this.currentMedia = '';
		this.playlist = options.playlist || [];
		this.playlistCurrentIdx = options.queueCurrentIdx || 0;
		this.state = options.state || this.allStates.Waiting;
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
			"player_impl": 'DummyPlayer',
			"player_state": this.state,
			"omx_state": this._getThirdPartyPlayerState(),
			"queue_current_item": this.getCurrentMedia(),
			"queue_length": this.playlist.length,
			"queue_item_position": this.playlist.length === 0 ? 0 : this.playlistCurrentIdx + 1,
			"queue_content": this.playlist
		};
		winston.info('Player state is: ', this.state);
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