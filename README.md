[![Build Status](https://travis-ci.org/Aleksandre/rpid.svg?branch=master)](https://travis-ci.org/Aleksandre/rpid)
##Introduction
The RPID project goal is to transform a Raspberry Pi system into a *Chromecast*-like system to remotely play multimedia files shared on a local network.

##Dependencies
RPID is built with Node.js. To start developing on Ubuntu, install the following dependencies:

```
apt-get install nodejs
apt-get install grunt
npm install -g nodemon
```

##Installation
To start coding, clone the github repository , install the dependencies via the *npm* tool and run grunt to start a server on [http://localhost:3000](http://localhost:3000/state).
```
git clone git@github.com:Aleksandre/rpid.git
cd rpid/
npm install
grunt run
```

##Usage
Action        | Command
------------- | -------------
grunt run | Start a development server on [http://localhost:3000/](http://localhost:3000/)
grunt run-ui | Start an instance of the Python UI 
grunt test --force | Run unit tests and analyze the code with jslint


##Architecture
![System architecture](./doc/architecture.png)


##API
RPID is a JSON only API.

By importing [./doc/api_postman.json](./doc/api_postman.json) into the  [Postman rest client tool](https://chrome.google.com/webstore/detail/postman-rest-client/fdmmgilgnpjigdojojpjoooidkmcomcm?hl=en), you will be able to see a description of the API as well as launch pre-defined queries against any RPID server.

###Requests
URL | Action | Description
------ | --------- | -------------
/pause | POST | Pause the player if it is paused
/play | POST | Add one or many items to the playlist and starts playing them
/play/next | POST | Play the next item in the playlist
/play/prev | POST | Play the previous item in the playlist
/playlist | GET | Returns the current playlist
/playlist/add | POST | Add one or many items to the playlist
/playlist/clear | POST | Empty the current playlist
/resume | POST | Resume the playback
/state | GET | Returns the player state
/stop	| POST | Stop the player if it is playing
/volume/down | POST | Decrease the volume
/volume/up | POST | Increase the volume

###Examples
####Responses
#####Success
On a successful request, RPID will answer with a 200 OK response and the current player state with the following JSON response:
```
GET /state
200 OK

{
    "player_impl": "DummyPlayer",
    "player_state": "Paused",
    "queue_current_item": "./file_1.mp4",
    "queue_length": 2,
    "queue_item_position": 1,
    "queue_content": [
        "./file_1.mp4",
        "./file_2.mp4"
    ]
}
```
Field | Description
-------- | ---------
player_impl | The media player to which RPID is delegating the play requests. A dummy player is provided for tests purposes.
player_state| The current media player state: *Playing*, *Waiting*, *Paused* or *Stopped*.
queue_current_item | The URL of the file currently playing.
queue_length | The number of items in the playlist.
queue_item_position | The playlist index of the currently playing item.
queue_content| The playlist items.

#####Failure
On a failed request, RPID will return a 400 Bad Request response and a description of the problem with the following JSON response:
```
POST /play
400 Bad Request

{
    "error_message": "Player rejected play request because no valid track was specified and the playlist is empty",
    "server_state": {
        ...
    },
    "stacktrace": "Error at BasePlayer.play ./src/core/player.js:101:11)\n
}
```
Field | Description
-------- | ---------
error_message | A textual description of the error.
player_state | The current player state.
stackrace | Optionnaly, the stacktrace of the actual error.

####Requests
#####Play one item
```
POST /play
data: {
    "itemURL":[
      "/file.mp4"
      ]
  }
```
#####Play multiple items
```
POST /play
data: {
"itemURL":[
    "/file_1.mp4", "/file_2.mp4", "/file_3.mp4"
    ]
}
```
#####Queue one item
```
POST /playlist/add
data: {
  "itemURL":[
    "/file.mp4"
    ]
}
```
#####Queue multiple items
```
POST /playlist/add
data: {
"itemURL":[
    "/file_1.mp4", "/file_2.mp4", "/file_3.mp4"
    ]
}
```

##Configuration
Check out [the grunt file] (./Gruntfile.js) and the default [config] (./core/config.js) file if you want to configure the development or runtime environment.
