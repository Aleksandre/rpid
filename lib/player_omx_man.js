var omx = require('omx-manager');
var winston = require('winston');
var BasePlayer = new require('./player.js').BasePlayer;

var PlayerOmxManager = BasePlayer;
module.exports = PlayerOmxManager;

PlayerOmxManager.prototype = {

	__proto__: BasePlayer.prototype,

	constructor: BasePlayer,

	init: function (options) {

		this.playerName = "OmxManagerPlayer";

		this.allCommands = {
			'play': omx.play,
			'stop': omx.stop,
			'pause': omx.pause,
			'resume': omx.play,
			'volup': omx.increaseVolume,
			'voldown': omx.decreaseVolume
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
		winston.info('OmxManagerPlayer is binding to OMXDirector events');
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
			"player_impl": this.playerName,
			"player_state": this.state,
			"omx_state": this._getThirdPartyPlayerState(),
			"queue_current_item": this.getCurrentMedia(),
			"queue_length": this.playlist.length,
			"queue_item_position": this.playlist.length === 0 ? 0 : this.playlistCurrentIdx + 1,
			"queue_content": this.playlist
		};
		winston.info('Player state is: ', this.state);
		return state;
	}
};