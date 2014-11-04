var fs = require('fs');
var path = require('path');
var winston = require('winston');
var config = require('./config.js');
var EventEmitter = require('events').EventEmitter;

/**
 * Player Factory
 *
 * Return the Player implementation configured for the specified or current environnement (process.env.NODE_ENV).
 */
function getPlayer(env) {
	env = env || process.env.NODE_ENV;

	if (!(env in config.players)) {
		winston.error("getPlayer: No player implementation defined for env <%s>", env);
		throw new Error("getPlayer: NoPlayerForEnv");
	}
	var player = config.players[env];
	winston.info('getPlayer: returning impl for player <%s> ', player);

	switch (player) {
	case 'base':
		return BasePlayer;
	case 'omxdirector':
		return require('./player_omx_dir.js');
	case 'omxmanager':
		return require('./player_omx_man.js');
	case 'mplayer':
		return require('./player_mplayer.js');
	default:
		throw new Error("getPlayer: The section player in config.js is pointing to an unknown player type: ", player)
	}
};


/**
 * BasePlayer is the class from which all players implementation inherit.
 * This player won't play any sound or video. It will simply log
 * each command you submit while keeping it's state and playlist
 * into memory.
 *
 */
function BasePlayer(options) {
	winston.info("BasePlayer is initializing");
	this.init(options || {});
	this.bindEvents();
};

BasePlayer.prototype = {

	__proto__: EventEmitter.prototype,

	constructor: BasePlayer,

	init: function (options) {

		this.playerName = "BasePlayer";

		this.allCommands = {
			'play': this.onStartedPlaying.bind(this),
			'stop': this.onStopped.bind(this),
			'pause': this.onPaused.bind(this),
			'resume': this.onStartedPlaying.bind(this)
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
		this.thirdPartyState = '';
	},

	bindEvents: function () {
		winston.info('Player is binding to 3rd party player events');
	},

	unbindEvents: function () {
		winston.info('Player is unbinding from 3rd party player events');
	},

	getState: function () {
		var state = {
			"player_impl": 'DummyPlayer',
			"player_state": this.state,
			"queue_current_item": this.getCurrentMedia(),
			"queue_length": this.playlist.length,
			"queue_item_position": this.playlist.length === 0 ? 0 : this.playlistCurrentIdx + 1,
			"queue_content": this.playlist
		};
		winston.info('Player state is: ', this.state);
		return state;
	},

	getCurrentMedia: function () {
		return this.currentMedia;
	},

	play: function (mediaURL, cb) {
		if (mediaURL instanceof Array) {
			// Play a list of items
			winston.info('Player is creating a new playlist with files: <%s>', mediaURL);
			this.stop();
			this.clearPlaylist();
			this.addItemsToPlaylist(mediaURL);
			this._sendPlayCmd(this.playlist[this.playlistCurrentIdx], cb);
		} else if (typeof mediaURL === "string") {
			// Play one item
			winston.info('Player is creating a new playlist and playing the file: <%s>', mediaURL);
			this.stop();
			this.clearPlaylist();
			this.addItemToPlaylist(mediaURL);
			this._sendPlayCmd(this.playlist[this.playlistCurrentIdx], cb);
		} else if (!mediaURL && this.state === this.allStates.Playing) {
			winston.info('Player is pausing because it received a play request while already playing')
			this.pause(cb);
		} else if (this.playlist[this.playlistCurrentIdx]) {
			// Play the current item in the playlist
			winston.info('Player is starting to play the current track in the playlist: <%s>', this.playlist[this.playlistCurrentIdx]);
			return this._sendPlayCmd(this.playlist[this.playlistCurrentIdx], cb);
		} else if (this.currentMedia) {
			// Play the current item in the playlist
			winston.info('Player is starting to play the current media: <%s>', this.currentMedia);
			return this._sendPlayCmd(this.currentMedia, cb);
		} else {
			// Nothing todo. Explain to user.
			var msg = "Player rejected play request because no valid track was specified and the playlist is empty";
			winston.info(msg);
			if (cb && typeof cb === "function") {
				var error = new Error(msg);
				cb.call(this, error);
			}
		}
	},

	start: function ()  {
		winston.info('Player has started');
		return this._watchThirdPartyPlayer('play');
	},

	stop: function (cb)  {
		winston.info('Player has sent a stop request to 3rd party player');
		var exec = require('child_process').exec;
		exec('pkill omxplayer', (function (err, stdout, stderr) {
			if (stdout) {
				console.log('stdout:' + stdout)
			};
			if (stderr) {
				console.log('stderr:' + stderr)
			};
			if (err) {
				winston.error(err);
			}
			this.onStopped();
			if (cb && typeof cb === "function") {
				cb.call(this, true);
			}
		}).bind(this));
		return true;
	},

	pause: function (cb)  {
		if (this.state === this.allStates.Paused) {
			if (cb && typeof cb === "function") {
				cb.call(this, true);
			}
		} else if (this.state === this.allStates.Playing) {
			winston.info('Player has sent a pause request to 3rd party player');
			return this._sendCmdToThirdPartyPlayer('pause', cb);
		}
	},

	resume: function (cb)  {
		if (this.state !== this.allStates.Playing) {
			winston.info('Player has sent a resume request to 3rd party player');
			return this._sendCmdToThirdPartyPlayer('play', cb);
		} else {
			winston.info('Player did not send resume request because it is already playing');
			if (cb && typeof cb === "function") {
				cb.call(this, true);
			}
		}
	},

	addItemToPlaylist: function (item)  {
		if (item) {
			winston.info("Player added a new item to the queue");
			this.playlist.push(unescape(item));
			return this.playlist;
		} else {
			winston.info("Player did not queue the new item because it is empty");
		}
	},

	addItemsToPlaylist: function (items)  {
		if (items instanceof Array) {
			items.forEach((function (item) {
				this.addItemToPlaylist(item);
			}).bind(this));
		} else {
			winston.info("Player did not queue the new item because it is not an Array");
		}
	},

	clearPlaylist: function ()  {
		winston.info("Player has cleared it's play queue");
		this.playlist = [];
		this.playlistCurrentIdx = 0;
		this.playlistCurrentItem = '';
	},

	playNext: function (cb)  {
		if (this.playlistCurrentIdx < this.playlist.length - 1) {
			winston.info('Player playlist has <%d> item(s)', this.playlist.length);
			this.playlistCurrentIdx = this.playlistCurrentIdx + 1;
			var media = this.playlist[this.playlistCurrentIdx];
			winston.info("Player is playing item <%s> at position <%d> from the playlist", media, this.playlistCurrentIdx);
			this.stop();
			this._sendPlayCmd(media, cb);
			return;
		} else {
			var msg = "Player received a playNext request but has no next track to play"
			winston.info(msg);
			if (cb && typeof cb === "function") {
				cb.call(this, new Error(msg));
			}
		}
	},

	playPrevious: function (cb)  {
		if (this.playlistCurrentIdx > 0) {
			this.playlistCurrentIdx = this.playlistCurrentIdx - 1;
			var media = this.playlist[this.playlistCurrentIdx];
			winston.info("Player is playing item <%s> at position <%d> from the queue", media, this.playlistCurrentIdx);
			this.stop();
			return this._sendPlayCmd(media, cb);
		} else {
			var msg = "Player received a playPrevious request but has no previous track to play"
			winston.info(msg);
			if (cb && typeof cb === "function") {
				cb.call(this, new Error(msg));
			}
		}
	},

	volumeUp: function ()  {
		winston.info('Player has sent 3rd party player a request to increase the volume');
		return this._sendCmdToThirdPartyPlayer('volup');
	},

	volumeDown: function ()  {
		winston.info('Player has sent 3rd party player a request to decrease the volume');
		return this._sendCmdToThirdPartyPlayer('voldown');
	},

	onLoaded: function (files, options) {
		winston.info("Player has loaded files into 3rd party player");
		this.state = this.allStates.Paused;
		this.emit(this.allEvents.onPlayerLoadedMedia);
	},

	onStopped: function () {
		winston.info("Player has stopped playing");
		this.state = this.allStates.Stopped;
		this.emit(this.allEvents.onPlayerStopped);
		this._writeStateToFile(this.getState());
	},

	onStartedPlaying: function () {
		winston.info("Player has started playing");
		this.state = this.allStates.Playing;
		this.emit(this.allEvents.onPlayerStartedPlaying);
		this._writeStateToFile(this.getState());
	},

	onPaused: function () {
		winston.info("Player has paused");
		this.state = this.allStates.Paused;
		this.emit(this.allEvents.onPlayerPaused);
		this._writeStateToFile(this.getState());
	},

	_writeStateToFile: function (state) {
		try {
			var jsonState = JSON.stringify(state, null, 4);
			fs.writeFile(config.ui.pipeFile, jsonState, function (err) {
				if (err)  {
					winston.info('Player could not safe state to file:');
					winston.error(error);
				} else {
					winston.info('Player saved its current state to <%s>', config.ui.pipeFile);
				}
			});
		} catch (err) {
			winston.error("Could not write state to file:");
			winston.error(err);
		}
	},

	_getThirdPartyPlayerState: function ()  {
		return {
			'state': this.state
		};
	},

	_watchThirdPartyPlayer: function () {
		this.watcherID = setInterval((function () {
			var state = this._getThirdPartyPlayerState();
			if (state !== this.thirdPartyState) {
				this.thirdPartyState = state;
				//this._writeStateToFile(this.getState());
			}
		}).bind(this), 5000);
	},

	_stopWatchingThirdPartyPlayer: function () {
		if (this.watcherID !== -1) {
			clearInterval(this.watcherID);
			this.watcherID = -1;
		}
	},

	_sendPlayCmd: function (mediaURL, cb) {
		var result = null;
		if (!mediaURL) {
			result = Error('Player: NoMediaURLSpecified');
		} else if (!(fs.existsSync(mediaURL))) {
			result = new Error('Player: FileNotFound ' + mediaURL);
		} else {
			this.currentMedia = mediaURL;

			function sendRequest() {
				winston.info('Player sent a play request for file <%s> to 3rd party player', mediaURL);
				var result = this._sendCmdToThirdPartyPlayer('play', this.currentMedia);
				if (cb && typeof cb === "function") {
					cb.call(this, result);
				}
			};
			setTimeout(sendRequest.bind(this), 750);
			return;
		}
		if (result && cb && typeof cb === "function") {
			cb.call(this, result);
		}
	},

	_sendCmdToThirdPartyPlayer: function (cmd, args, cb) {
		args = args || null;
		if (cmd in this.allCommands && typeof this.allCommands[cmd] === "function") {
			var fn = this.allCommands[cmd];
			fn(args);
			winston.info('Player has sent cmd <%s> to 3rd party', cmd);
			this._writeStateToFile(this.getState());
			if (cb && typeof cb === "function") {
				cb.call(this, true);
			}
		} else {
			winston.error('Player has no command for cmd <%s> ', cmd);
			if (cb && typeof cb === "function") {
				cb.call(this, new Error('Player: CommandNotFound'));
			}
		}
	},

	dispose: function ()  {
		winston.info('Player is disposing');
		try {
			this.stop();
		} catch (err) {
			winston.error(err);
		}
		this._writeStateToFile(this.getState());
		this._stopWatchingThirdPartyPlayer();
		this.unbindEvents();
	},
};

exports.BasePlayer = BasePlayer;
exports.getPlayer = getPlayer;