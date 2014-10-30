var config = require('./config.js');
var should = require('should');

var testPlayer = function (player, playerName) {
	describe(playerName, function () {

		describe(".play()", function () {

			it("should start playing the specified media", function () {
				player.play(config.validMediaURL);
				var result = player.getState();
				var playerState = result.player_state;
				should(playerState).equal(player.allStates.Playing);
			});

			it("return an error when no file was specified", function () {
				player.clearPlaylist();
				player.stop();
				should(player.getState().player_state).equal(player.allStates.Stopped);
				should(player.play()).be.an.Error;
			});

			it("should return an error when file is not found found", function () {
				player.clearPlaylist();
				player.stop();
				should(player.getState().player_state).equal(player.allStates.Stopped);
				should(player.play(config.invalidMediaURL)).be.an.Error;
			});

			it("should stop playing the current media if one is playing", function () {
				player.clearPlaylist();
				player.stop();
				should(player.getState().player_state).equal(player.allStates.Stopped);

				player.play(config.validMediaURL);
				var initialState = player.getState();
				should(player.getState().player_state).equal(player.allStates.Playing);
				should(initialState.queue_current_item).not.equal('');

				player.play(config.validMediaURL2);
				var secondState = player.getState();
				should(secondState.queue_current_item).not.equal('');

				should(initialState.queue_current_item).not.equal(secondState.queue_current_item);
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

		describe(".stop()", function () {
			it("should stop playing the currently playing media", function () {
				player.play(config.validMediaURL);
				should(player.getState().player_state).be.exactly(player.allStates.Playing);

				player.stop();
				should(player.getState().player_state).be.exactly(player.allStates.Stopped);
			});

			it("should change state after it stopped playing", function () {

			});

			it("should throw a onStoppedPlayingEvent", function () {
				//Test Goes Here
			});
		});

		describe(".pause()", function () {
			it("should pause playing the currently playing media", function () {
				player.play(config.validMediaURL);
				should(player.getState().player_state).be.exactly(player.allStates.Playing);

				player.pause();
				should(player.getState().player_state).be.exactly(player.allStates.Paused);
			});


			it("should throw a onPausedEvent", function () {
				//Test Goes Here
			});
		});

		describe(".resume()", function () {
			it("should resume playing the currently paused media", function () {
				player.play(config.validMediaURL);
				should(player.getState().player_state).be.exactly(player.allStates.Playing);

				player.pause();
				should(player.getState().player_state).be.exactly(player.allStates.Paused);

				player.resume();
				should(player.getState().player_state).be.exactly(player.allStates.Playing);
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
				player.addItemsToPlaylist([url, url, url]);

				player.play();
				should(player.getState().queue_item_position).be.exactly(1);

				player.playNext();
				should(player.getState().queue_item_position).be.exactly(2);

				player.playNext();
				should(player.getState().queue_item_position).be.exactly(3);
			});

			it("should continue playing if there are no media in the queue and playNext is called", function () {
				var url = config.validMediaURL;
				var original_queue = [url];
				player.clearPlaylist();
				player.stop();
				player.addItemsToPlaylist(original_queue);

				player.play();
				should(player.currentMedia).be.exactly(url);

				player.playNext();
				should(player.currentMedia).be.exactly(url);

				should(player.getState().player_state).be.exactly(player.allStates.Playing);
			});
		});

		describe(".playPrevious()", function () {
			it("should play the previous media if one is in the queue and playPrevious is called", function () {
				player.clearPlaylist();
				player.stop();

				var url = config.validMediaURL;
				player.addItemsToPlaylist([url, url]);

				player.play();
				should(player.getState().queue_item_position).be.exactly(1);

				player.playNext();
				should(player.getState().queue_item_position).be.exactly(2);

				player.playPrevious();
				should(player.getState().queue_item_position).be.exactly(1);

				player.playPrevious();
				should(player.getState().queue_item_position).be.exactly(1);

				should(player.getState().player_state).be.exactly(player.allStates.Playing);
			});
		});
	});
};

var BasePlayer = require('../core/player.js').BasePlayer;
var BasePlayer = new BasePlayer();
testPlayer(BasePlayer, 'ConsolePlayer');

//var PlayerOmxDirector = require('../core/player_omx.js');
//var playerOmxDirector = new PlayerOmxDirector();
//testPlayer(playerOmxDirector,'OmxDirectorPlayer');