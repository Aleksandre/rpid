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
	sudo pkill nodejs
	sudo pkill rpid
	
	# Copy specific config
	cd /home/pi/rpid/src
	cp ./core/config_prod.js ./core/config.js

	# Restart the service
	export NODE_ENV=production
	nodejs ./app.js&
EOF

