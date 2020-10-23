#!/bin/bash

# Extension build script
# Syntax:
#   build.sh <platform>
# Platforms:
#   'chrome', 'firefox', or 'prod'

PLATFORM=$1
STYLEFILES="./src/* ./src/**/* ./src/**/**/*"
set -e

if [[ $PLATFORM != "chrome" ]] && [[ $PLATFORM != "firefox" ]] && [[ $PLATFORM != "prod" ]]; then
    echo "Invalid platform type. Supported platforms are 'chrome', 'firefox', and 'prod'"
    exit 1
fi

echo "Removing old build files..."
rm -rf build dist
rm -rf firefox chrome release
echo "Checking style..."
if ./node_modules/.bin/prettier --check $STYLEFILES 1> /dev/null ; then
    true
else
    ./node_modules/.bin/prettier --check $STYLEFILES --write
fi

./node_modules/.bin/eslint . --ext .js,.ts

echo "Compiling..."
if [[ $PLATFORM = "prod" ]]; then
    ./node_modules/webpack-cli/bin/cli.js --config webpack.prod.js
else
    ./node_modules/webpack-cli/bin/cli.js
fi

postCompile () {
    mkdir $1
    cp -r dist images _locales LICENSE manifest.json $1
}

if [[ $PLATFORM = "prod" ]]; then
    postCompile "chrome"
    postCompile "firefox"
    mkdir release
    mv chrome firefox release
else
    postCompile $PLATFORM
fi

echo -e "\033[0;32mDone!\033[0m"
