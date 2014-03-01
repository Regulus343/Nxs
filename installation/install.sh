#!/bin/bash

#set Nxt version to be downloaded and installed
source resources/version.sh

#set standard variables
nxtFileBasename=nxt-client-$nxtVersion
nxtZipFilename=$nxtFileBasename.zip
nxtHashFilename=$nxtFileBasename.sha256.txt.asc
nxsDirName=Nxs-master

#navigate out of Nxs directory
cd ../..
echo ""

#download client and hash file if necessary and verify hash
source $nxsDirName/installation/resources/verify-hash.sh

#unzip Nxt directory
echo -e "Unzipping Nxt client archive...\n"
unzip $nxtZipFilename

#remove zip archive and hash file
rm $nxtZipFilename
rm $nxtHashFilename

#copy properties file
echo -e "\nCopying nxt.properties file preconfigured for Nxs...\n"
cp $nxsDirName/installation/resources/nxt-nxs.properties nxt/conf/nxt.properties

#rename Nxs directory
echo -e "Renaming Nxs directory...\n"
mv $nxsDirName nxt/html/nxs

echo -e "Nxt/Nxs successfully installed!\n"
cd nxt