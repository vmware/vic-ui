# Copyright 2016-2017 VMware, Inc. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#    http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

REV :=$(shell git rev-parse --short=8 HEAD)
TAG :=$(shell git for-each-ref --format="%(refname:short)" --sort=-authordate --count=1 refs/tags) # e.g. `v0.9.0`
TAG_NUM :=$(shell git for-each-ref --format="%(refname:short)" --sort=-authordate --count=1 refs/tags | cut -c 2-) # e.g. `0.9.0`

BIN ?= bin

VICUI_SOURCE_PATH = "flex/vic-ui"
VICUI_H5_UI_PATH = "h5c/vic"
VICUI_H5_SERVICE_PATH = "h5c/vic-service"
GCP_DOWNLOAD_PATH = "https://storage.googleapis.com/vic-engine-builds/"
SDK_PACKAGE_ARCHIVE = "vic-ui-sdk.tar.gz"
UI_INSTALLER_WIN_PATH = "scripts/vCenterForWindows"
ENV_VSPHERE_SDK_HOME = "/tmp/sdk/vc_sdk_min"
ENV_FLEX_SDK_HOME = "/tmp/sdk/flex_sdk_min"
ENV_HTML_SDK_HOME = "/tmp/sdk/html-client-sdk"

yarn:
	@npm install -g yarn@0.24.6 > /dev/null

vic-ui-plugins: yarn
	sed -e "s/0.0.1/$(shell printf %s ${TAG_NUM}.${BUILD_NUMBER})/" -e "s/\-rc[[:digit:]]//g" ./$(VICUI_H5_UI_PATH)/plugin-package.xml > ./$(VICUI_H5_UI_PATH)/new_plugin-package.xml
	sed -e "s/0.0.1/$(shell printf %s ${TAG_NUM}.${BUILD_NUMBER})/" -e "s/\-rc[[:digit:]]//g" ./$(VICUI_SOURCE_PATH)/plugin-package.xml > ./$(VICUI_SOURCE_PATH)/new_plugin-package.xml
	sed "s/UI_VERSION_PLACEHOLDER/$(shell printf %s ${TAG}.${BUILD_NUMBER})/" ./$(VICUI_H5_SERVICE_PATH)/src/main/resources/configs.properties > ./$(VICUI_H5_SERVICE_PATH)/src/main/resources/new_configs.properties
	rm ./$(VICUI_SOURCE_PATH)/plugin-package.xml ./$(VICUI_H5_UI_PATH)/plugin-package.xml ./$(VICUI_H5_SERVICE_PATH)/src/main/resources/configs.properties
	mv ./$(VICUI_SOURCE_PATH)/new_plugin-package.xml ./$(VICUI_SOURCE_PATH)/plugin-package.xml
	mv ./$(VICUI_H5_UI_PATH)/new_plugin-package.xml ./$(VICUI_H5_UI_PATH)/plugin-package.xml
	mv ./$(VICUI_H5_SERVICE_PATH)/src/main/resources/new_configs.properties ./$(VICUI_H5_SERVICE_PATH)/src/main/resources/configs.properties
	wget -nv $(GCP_DOWNLOAD_PATH)$(SDK_PACKAGE_ARCHIVE) -O /tmp/$(SDK_PACKAGE_ARCHIVE)
	tar -xzf /tmp/$(SDK_PACKAGE_ARCHIVE) -C /tmp/
	ant -f $(VICUI_SOURCE_PATH)/build-deployable.xml -Denv.VSPHERE_SDK_HOME=$(ENV_VSPHERE_SDK_HOME) -Denv.FLEX_HOME=$(ENV_FLEX_SDK_HOME)
	ant -f h5c/build-deployable.xml -Denv.VSPHERE_SDK_HOME=$(ENV_VSPHERE_SDK_HOME) -Denv.FLEX_HOME=$(ENV_FLEX_SDK_HOME) -Denv.VSPHERE_H5C_SDK_HOME=$(ENV_HTML_SDK_HOME) -Denv.BUILD_MODE=prod
	ls -la scripts/
	mkdir -p $(BIN)/ui
	cp -rf scripts/* $(BIN)/ui
	# cleanup
	rm -rf $(VICUI_H5_UI_PATH)/src/vic-app/aot
	rm -f $(VICUI_H5_UI_PATH)/src/vic-app/yarn.lock
	rm -rf $(VICUI_H5_UI_PATH)/src/vic-app/node_modules

vic-appliance-ui: yarn
	cd appliance-ui && yarn
	cd appliance-ui && npm run build:dev
	ls -la appliance-ui/dev/

clean:
	@rm -rf $(VICUI_H5_UI_PATH)/src/vic-app/node_modules
	@rm -f $(VICUI_H5_UI_PATH)/src/vic-app/yarn.lock
