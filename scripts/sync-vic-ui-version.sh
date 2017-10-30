#!/bin/bash -e
# Copyright 2017 VMware, Inc. All Rights Reserved.
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
#

# This script synchronizes the version information of the VIC UI plugins
# with that of VIC Engine. Be sure to provide a correct path, by using the -p flag,
# to the 'bin' folder where 'vic-machine-*'' binaries and 'ui' folder are located.

VIC_BIN_ROOT=./bin/
UNAME_V=$(uname -v)
CURRENT_WORKING_DIR=$(pwd)

show_error () {
    echo "Usage: $0 [-p /path/to/bin-folder]" >&2
    exit 1
}

while getopts :p: flag ; do
    case $flag in
        p)
            VIC_BIN_ROOT=$OPTARG
            if [ ${VIC_BIN_ROOT: -1} != "/" ] ; then
                VIC_BIN_ROOT=${VIC_BIN_ROOT}/
            fi
            ;;
        \?)
            show_error
            ;;
        *)
            show_error
            ;;
    esac
done

if [ $(echo $UNAME_V | grep -o "Darwin") ] ; then
    VIC_MACHINE_BIN_PATH="${VIC_BIN_ROOT}vic-machine-darwin"
else
    VIC_MACHINE_BIN_PATH="${VIC_BIN_ROOT}vic-machine-linux"
fi

if [ ! -f $VIC_MACHINE_BIN_PATH ] ; then
    echo "vic-machine binary does not exist at $VIC_MACHINE_BIN_PATH!" >&2
    exit 1
fi

# get version strings
FULL_VER_STRING=$($VIC_MACHINE_BIN_PATH version | awk '{print $3}' | sed -e 's/\-rc[[:digit:]]//g')
MAJOR_MINOR_PATCH=$(echo $FULL_VER_STRING | awk -F- '{print $1}' | cut -c 2-)
BUILD_NUMBER=$(echo $FULL_VER_STRING | awk -F- '{print $2}')

if [ ! -d ${VIC_BIN_ROOT}ui ] ; then
    echo "${VIC_BIN_ROOT}ui was not found!" >&2
    exit 1
fi

# update plugin-manifest
sed "s/version=.*/version=\"${MAJOR_MINOR_PATCH}\.${BUILD_NUMBER}\"/" ${VIC_BIN_ROOT}ui/plugin-manifest > /tmp/plugin-manifest
mv /tmp/plugin-manifest ${VIC_BIN_ROOT}ui/plugin-manifest

# update plugin-package.xml for flex and h5 client plugins
VIC_UI_VER_STRING=$(ls -l ${VIC_BIN_ROOT}ui/plugin-packages | grep '^d' | head -1 | awk '{print $9}' | awk -F- '{print $2}')
sed "s/vic\" version=\".*[[:digit:]]\"/vic\" version=\"$MAJOR_MINOR_PATCH\.$BUILD_NUMBER\"/" ${VIC_BIN_ROOT}ui/plugin-packages/com.vmware.vic-${VIC_UI_VER_STRING}/plugin-package.xml > /tmp/h5c-plugin-package.xml
sed "s/vic\.ui\" version=\".*[[:digit:]]\"/vic\.ui\" version=\"$MAJOR_MINOR_PATCH\.$BUILD_NUMBER\"/" ${VIC_BIN_ROOT}ui/vsphere-client-serenity/com.vmware.vic.ui-${VIC_UI_VER_STRING}/plugin-package.xml > /tmp/flex-plugin-package.xml
mv /tmp/h5c-plugin-package.xml ${VIC_BIN_ROOT}ui/plugin-packages/com.vmware.vic-${VIC_UI_VER_STRING}/plugin-package.xml
mv /tmp/flex-plugin-package.xml ${VIC_BIN_ROOT}ui/vsphere-client-serenity/com.vmware.vic.ui-${VIC_UI_VER_STRING}/plugin-package.xml

# update configs.properties in vic-service.jar with correct version info (h5 client plugin only)
cd ${VIC_BIN_ROOT}ui/plugin-packages/com.vmware.vic-${VIC_UI_VER_STRING}/plugins
unzip -o -d tmp vic-service.jar >/dev/null && cd tmp
sed "s/uiVersion\=.*/uiVersion=v${MAJOR_MINOR_PATCH}\.${BUILD_NUMBER}/" configs.properties > /tmp/vic-service-configs.properties
mv /tmp/vic-service-configs.properties configs.properties
rm ../vic-service.jar
jar cfm ../vic-service.jar META-INF/MANIFEST.MF * >/dev/null
cd .. && rm -rf tmp && cd $CURRENT_WORKING_DIR

echo version from the vic-ui repo is "${VIC_UI_VER_STRING}"
echo version from vic-machine binary is "v${MAJOR_MINOR_PATCH}.${BUILD_NUMBER}"
echo

# rename the plugin root folders
if [ ! $(echo $VIC_UI_VER_STRING | grep -o "v[[:digit:]]\.[[:digit:]]\.[[:digit:]]\.[[:digit:]]\+" | grep -o "v${MAJOR_MINOR_PATCH}.${BUILD_NUMBER}") ] ; then
    mv ${VIC_BIN_ROOT}ui/plugin-packages/com.vmware.vic-${VIC_UI_VER_STRING} ${VIC_BIN_ROOT}ui/plugin-packages/com.vmware.vic-v${MAJOR_MINOR_PATCH}.${BUILD_NUMBER}
    mv ${VIC_BIN_ROOT}ui/vsphere-client-serenity/com.vmware.vic.ui-${VIC_UI_VER_STRING} ${VIC_BIN_ROOT}ui/vsphere-client-serenity/com.vmware.vic.ui-v${MAJOR_MINOR_PATCH}.${BUILD_NUMBER}
fi

cd ${VIC_BIN_ROOT}ui/plugin-packages/com.vmware.vic-v${MAJOR_MINOR_PATCH}.${BUILD_NUMBER} && rm ../*.zip && zip -9 -r ../com.vmware.vic-v${MAJOR_MINOR_PATCH}.${BUILD_NUMBER}.zip * && cd ${CURRENT_WORKING_DIR}
cd ${VIC_BIN_ROOT}ui/vsphere-client-serenity/com.vmware.vic.ui-v${MAJOR_MINOR_PATCH}.${BUILD_NUMBER} && rm ../*.zip && zip -9 -r ../com.vmware.vic.ui-v${MAJOR_MINOR_PATCH}.${BUILD_NUMBER}.zip * && cd ${CURRENT_WORKING_DIR}
