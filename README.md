##Introduction
The RPID project goal is to create a *Chromecast*-like system to remotely play multimedia files shared on a local network.

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
grunt test --force | Run unit tests and analyze the code with jslint


##Architecture
![System architecture](./doc/architecture.png)


##API
By importing [./doc/api_postman.json](./doc/api_postman.json) into the  [Postman rest client tool](https://chrome.google.com/webstore/detail/postman-rest-client/fdmmgilgnpjigdojojpjoooidkmcomcm?hl=en), you will be able to see a description of the API as well as launch pre-defined queries against any RPID server.

###Description


###Requests
URL | Action | Description
------ | --------- | -------------
/pause | POST | Pause the player if it is paused
/play | POST | Play one or more items
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
####Play one item
'''
{
  "itemURL":[
    "/file.mp4"
    ]
}
'''
####Play multiple items
'''
"itemURL":[
    "/file_1.mp4", "/file_2.mp4", "/file_3.mp4"
    ]
'''
####Queue one item
'''
{
  "itemURL":[
    "/file.mp4"
    ]
}
'''
####Queue multiple items
'''
"itemURL":[
    "/file_1.mp4", "/file_2.mp4", "/file_3.mp4"
    ]
'''
####Play current playlist item
'''
'''

##Configuration
Check out [the grunt file] (./Gruntfile.js) and the default [config] (./core/config.js) file if you want to configure the development or runtime environment.
