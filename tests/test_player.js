var config = require('./config.js');
var should = require('should');

var testPlayer = function (player, playerName) {
	describe(playerName, function () {

		describe(".play()", function () {


			it("should start playing the specified media", function () {
				function cb() {
					var result = player.getState();
					var playerState = result.player_state;
					should(playerState).equal(player.allStates.Playing);
				};
				player.play(config.validMediaURL, cb);
			});

			it("return an error when no file was specified", function () {
				player.clearPlaylist();

				function stopCB() {
					should(player.getState().player_state).equal(player.allStates.Stopped);
					player.play(null, playCB);
				};

				function playCB(result) {
					should(player.getState().player_state).equal(player.allStates.Stopped);
					should(result).be.an.Error;
				};

				player.stop(stopCB);
			});

			it("should return an error when file is not found found", function () {
				player.clearPlaylist();

				function stopCB() {
					should(player.getState().player_state).equal(player.allStates.Stopped);

				};

				function playCB(result) {
					should(player.getState().player_state).equal(player.allStates.Stopped);
					should(result).be.an.Error;

				};

				player.stop(stopCB);
			});

			it("should stop playing the current media if one is playing", function () {
				function playCB() {
					var result = player.getState();
					var playerState = result.player_state;
					should(playerState).equal(player.allStates.Playing);

					player.stop(stopCB);
				};

				function stopCB() {
					var result = player.getState();
					var playerState = result.player_state;
					should(playerState).equal(player.allStates.Stopped);
				};

				player.clearPlaylist();
				player.stop();
				player.play(playCB);
			});

			it("should throw a onStartedPlayingEvent", function () {
				var errTimeout = setTimeout(function () {
					assert(false, 'Event never fired');
					done();
				}, 1000);

				function onStartedPlayer() {
					clearTimeout(errTimeout); //cancel error timeout
					assert(true);
					done();
				};

				player.on(player.allEvents.onStartedPlayingEvent, onStartedPlayer)
			});

			it("should clear the queue and add the item to the new queue", function () {
				var url = config.validMediaURL;
				var original_queue = [url, url, url];
				player.clearPlaylist();
				player.addItemsToPlaylist(original_queue);
				should(player.playlist).be.a.Array;
				should.exists(player.playlist.length);
				should(player.playlist.length).be.exactly(3);

				player.play(url);
				should(player.playlist).be.a.Array;
				should.exists(player.playlist.length);
				should(player.playlist.length).be.exactly(1);
			});
		});


		describe(".clearPlaylist()", function () {
			it("should empty the queue", function () {
				//Test Goes Here
			});

			it("should not stop playing", function () {
				//Test Goes Here
			});

			it("should reset the queue index pointer to 0", function () {
				//Test Goes Here
			});
		});


		describe(".addItemToPlaylist()", function () {
			it("should not allow empty media URL", function () {
				player.clearPlaylist();
				should(player.playlist.length).be.exactly(0);

				player.addItemToPlaylist('');
				should(player.playlist.length).be.exactly(0);
			});

			it("should add the item to the queue", function () {
				player.clearPlaylist();
				should(player.playlist.length).be.exactly(0);

				player.addItemToPlaylist(config.validMediaURL);
				should(player.playlist.length).be.exactly(1);
				should(player.playlist[0]).be.exactly(config.validMediaURL);
			});
		});

		describe(".queueMultipleItems()", function () {
			it("should not allow empty media URL", function () {
				//Test Goes Here
			});

			it("should add the items to the queue", function () {
				player.clearPlaylist();
				var url = config.validMediaURL;
				var urls = [url, url, url];
				player.addItemsToPlaylist(urls);
				should(player.getState().queue_length).be.exactly(urls.length);
			});
		});

		describe(".pause()", function () {
			it("should pause playing the currently playing media", function () {
				player.clearPlaylist();
				player.stop();

				function playCB() {
					should(player.getState().player_state).be.exactly(player.allStates.Playing);
					player.pause(pauseCB);
				};

				function pauseCB() {
					should(player.getState().player_state).be.exactly(player.allStates.Paused);
				};
				player.play(config.validMediaURL, playCB);
			});


			it("should throw a onPausedEvent", function () {
				//Test Goes Here
			});
		});

		describe(".resume()", function () {
			it("should resume playing the currently paused media", function () {
				player.clearPlaylist();
				player.stop();

				function playCB() {
					should(player.getState().player_state).be.exactly(player.allStates.Playing);
					player.pause(pauseCB);
				};

				function pauseCB() {
					should(player.getState().player_state).be.exactly(player.allStates.Paused);
					player.resume(resumeCB);
				};

				function resumeCB() {
					should(player.getState().player_state).be.exactly(player.allStates.Playing);
				};

				player.play(config.validMediaURL, playCB);
			});

			it("should change state after it resumed playing", function () {

			});

			it("should throw a onPlayerStartedPlayingEvent", function () {

			});
		});

		describe(".playNext()", function () {
			it("should play the next media if one is in the queue", function () {
				player.clearPlaylist();

				var url = config.validMediaURL;
				player.addItemsToPlaylist([url, url]);

				function stopCB() {
					should(player.getState().player_state).be.exactly(player.allStates.Stopped);
					player.play(playCB);
				};

				function playCB() {
					should(player.getState().player_state).be.exactly(player.allStates.Playing);
					should(player.getState().queue_item_position).be.exactly(1);
					player.playNext(secondPlayCB);
				};

				function secondPlayCB() {
					should(player.getState().player_state).be.exactly(player.allStates.Playing);
					should(player.getState().queue_item_position).be.exactly(2);
				};

				player.stop(stopCB);
			});

			it("should continue playing if there are no media in the queue and playNext is called", function () {

				player.clearPlaylist();

				var url = config.validMediaURL;
				player.addItemsToPlaylist([url]);

				function stopCB() {
					should(player.getState().player_state).be.exactly(player.allStates.Stopped);
					player.play(playCB);
				};

				function playCB() {
					should(player.getState().player_state).be.exactly(player.allStates.Playing);
					should(player.getState().queue_item_position).be.exactly(1);
					player.playNext(secondPlayCB);
				};

				function secondPlayCB() {
					should(player.getState().player_state).be.exactly(player.allStates.Playing);
					should(player.getState().queue_item_position).be.exactly(1);
				};

				player.stop(stopCB);
			});
		});

		describe(".playPrevious()", function () {
			it("should play the previous media if one is in the queue and playPrevious is called", function () {
				player.clearPlaylist();

				var url = config.validMediaURL;
				player.addItemsToPlaylist([url, url]);

				function stopCB() {
					should(player.getState().player_state).be.exactly(player.allStates.Stopped);
					player.play(null, playCB);
				};

				function playCB() {
					should(player.getState().player_state).be.exactly(player.allStates.Playing);
					should(player.getState().queue_item_position).be.exactly(1);
					player.playNext(secondPlayCB);
				};

				function secondPlayCB() {
					should(player.getState().player_state).be.exactly(player.allStates.Playing);
					should(player.getState().queue_item_position).be.exactly(2);
					player.playPrevious(playPreviousCB);
				};

				function playPreviousCB() {
					should(player.getState().player_state).be.exactly(player.allStates.Playing);
					should(player.getState().queue_item_position).be.exactly(1);
					player.playPrevious(secondPreviousCB);
				};

				function secondPreviousCB() {
					should(player.getState().player_state).be.exactly(player.allStates.Playing);
					should(player.getState().queue_item_position).be.exactly(1);
				};

				player.stop(stopCB);
			});
		});
	});
};

var BasePlayer = require('../lib/player.js').BasePlayer;
var BasePlayer = new BasePlayer();
testPlayer(BasePlayer);

//var PlayerOmxDirector = require('../core/player_omx_dir.js');
//var playerOmxDirector = new PlayerOmxDirector();
//testPlayer(playerOmxDirector);