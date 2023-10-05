#! /bin/bash

VERSION=$(npm pkg get version | xargs echo)
NAME=$(npm pkg get name | xargs echo)

yarn build:linux

sudo apt-get remove ${NAME}
sudo dpkg --purge ${NAME}

sudo dpkg -i ./dist/${NAME}_${VERSION}_amd64.deb
sudo apt-get install -f
