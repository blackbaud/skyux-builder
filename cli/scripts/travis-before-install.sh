# Fail the build if this step fails
set -e

chmod +x ./node_modules/@blackbaud/skyux-builder/cli/scripts/travis-after-script.sh
chmod +x ./node_modules/@blackbaud/skyux-builder/cli/scripts/travis-after-success.sh

# http://blog.500tech.com/setting-up-travis-ci-to-run-tests-on-latest-google-chrome-version/
export CHROME_BIN=/usr/bin/google-chrome
export DISPLAY=:99.0
sh -e /etc/init.d/xvfb start
sudo apt-get update
sudo apt-get install -y libappindicator1 fonts-liberation
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome*.deb
npm install -g @blackbaud/skyux-cli
