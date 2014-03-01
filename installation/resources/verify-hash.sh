#!/bin/bash

#set standard variables
nxtUrl=http://download.nxtcrypto.org/

#download Nxt client zip archive if it doesn't already exist
if [ ! -f $nxtZipFilename ]; then
	echo -e "Downloading Nxt client archive...\n"
	wget $nxtUrl$nxtZipFilename
fi

#download SHA-256 hash file if it doesn't already exist
if [ ! -f $nxtHashFilename ]; then
	echo -e "Downloading SHA-256 hash...\n"
	wget $nxtUrl$nxtHashFilename
fi

#check file against hash
echo -e "Checking file against hash...\n"
hashCheck=$(sha256sum -c $nxtHashFilename 2>&1 | grep OK)

#abort installation if hash doesn't match
if [ "$hashCheck" != "$nxtZipFilename: OK" ]; then
	echo -e "Hash incorrect! Process aborted...\n"
	exit
else
	echo -e "Hash successfully verified!\n"
fi