var MPlayer = require('node-mplayer');
var winston = require('winston');
var BasePlayer = new require('./player.js').BasePlayer;

var PlayerMplayer = BasePlayer;
module.exports = PlayerMplayer;

PlayerMplayer.prototype = {

	__proto__: BasePlayer.prototype,

	constructor: BasePlayer,

	init: function (options) {
		options = options || {};
		this.player = new MPlayer();

		this.playerName = "OmxMPlayer";

		this.allCommands = {
			'play': this._play.bind(this),
			'stop': this.player.stop,
			'pause': this.player.pause,
			'resume': this.player.pause
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
		winston.info('PlayerMplayer is binding to mPlayer events');
		this.player.on('end', this.onStopped.bind(this));
		this.player.on('error', this.onError.bind(this));
	},

	unbindEvents: function () {
		//this.player.off('end');
		//this.player.off('error');
	},

	getState: function () {
		var state = {
			"player_impl": 'mPlayer',
			"player_state": this.state,
			//"mplayer_state": this._getThirdPartyPlayerState(),
			"queue_current_item": this.getCurrentMedia(),
			"queue_length": this.playlist.length,
			"queue_item_position": this.playlist.length === 0 ? 0 : this.playlistCurrentIdx + 1,
			"queue_content": this.playlist
		};
		winston.info('Player state is: ', this.state);
		return state;
	},

	onError: function (error) {
		winston.info('The mPlayer process has thrown an error:')
		winston.error(error);
	},

	_play: function (file) {
		winston.info('mPlayer is setting the playing file: <%s>', file);
		try {
			this.player.stop();
		} catch (err) {
			winston.info('mPlayer process has thrown an exception:');
			winston.error(err);
		}
		this.player = new MPlayer();
		this.player.setFile(file);
		return this.player.play();
	}
};