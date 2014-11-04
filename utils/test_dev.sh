#!/bin/bash
# Running this script will update the code on the Raspberry Pi and restart
# a server with the updated version.
# 
# To use this script, be sure to:
# 1.  Generate your ssh keys
# 		ssh-keygen -t rsa
# 
# 2. Add your ssh key to the Raspberry Pi valid authorized_keys
# 		cat ~/.ssh/id_rsa.pub | ssh pi@raspberry 'cat >> .ssh/authorized_keys'
rsync -Pravdtze ssh ./ pi@raspberrypi:/home/pi/rpid/src/
ssh pi@raspberrypi << EOF
	# Kill old process
	sudo pkill rpid-service
	sudo pkill rpid-ui
	sudo pkill nodejs
	sudo pkill python
	
	# Copy specific config
	cd /home/pi/rpid/src
	cp ./lib/config_prod.js ./lib/config.js

	mkfifo /tmp/rpid-io-pipe
	# Restart the service
	export NODE_ENV=development
	nodejs ./app.js &
	python ./ui/main.py
EOF

