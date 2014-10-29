#!/bin/bash

rsync -Pravdtze ssh ./ pi@raspberrypi:/home/pi/rpid/src/
ssh pi@raspberrypi << EOF
	cd /home/pi/rpid/src
	cp ./core/config_prod.js ./core/config.js
EOF

