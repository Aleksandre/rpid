##Introduction
The RPID project goal is to create a *Chromecast*-like system to remotely play multimedia files shared on a local network.

##Dependencies
RPID is built with Node.js. To start developing, install the following dependencies:

```
apt-get install nodejs
apt-get install grunt
npm install -g nodemon
```

##Installation
To start developping, clone the github repository , install dependencies via the *npm* tool and
start a development server using *grunt*.
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
