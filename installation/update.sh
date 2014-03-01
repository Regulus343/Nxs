#!/bin/bash

#set Nxt version to be downloaded and installed
source resources/version.sh

#set standard variables
nxtFileBasename=nxt-client-$nxtVersion
nxtZipFilename=$nxtFileBasename.zip
nxtHashFilename=$nxtFileBasename.sha256.txt.asc
nxsDirName=Nxs-master
nxsZipFilename=master.zip

#navigate to root directory
cd ../../../..
echo ""

#backup Nxt's current nxt.properties config file
echo "Backing up Nxt's nxt.properties config file..."
cp nxt/conf/nxt.properties nxt.properties

#backup Nxs' current custom.js config file
echo -e "Backing up Nxs' custom.js config file...\n"
cp nxt/html/nxs/assets/js/config/custom.js custom.js

#download Nxs
echo -e "Downloading Nxs archive...\n"
wget https://github.com/Regulus343/Nxs/archive/$nxsZipFilename

#extract latest Nxs zip archive and remove it
echo -e "Unzipping Nxs archive...\n"
unzip $nxsZipFilename
rm $nxsZipFilename

#download client and hash file if necessary and verify hash
source $nxsDirName/installation/resources/verify-hash.sh

#remove entire "nxt" directory
echo -e "Removing old \"nxt\" directory...\n"
rm -rf nxt/*

#navigate into Nxs-master directory
cd $nxsDirName/installation

#run install.sh
source install.sh

#replace Nxt's nxt.properties config file with original version
echo -e "Replacing Nxt's nxt.properties config file...\n"
rm conf/nxt.properties
mv ../nxt.properties conf/nxt.properties

#replace Nxs' custom.js config file with original version
echo -e "Replacing Nxs' custom.js config file...\n"
rm html/nxs/assets/js/config/custom.js
mv ../custom.js html/nxs/assets/js/config/custom.js

echo -e "Nxt/Nxs successfully updated!\n"