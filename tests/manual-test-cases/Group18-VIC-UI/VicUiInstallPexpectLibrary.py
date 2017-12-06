# Copyright 2016-2017 VMware, Inc. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#	http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License

import os.path
import pexpect
import time
import platform
import signal
from pexpect.popen_spawn import PopenSpawn

class VicUiInstallPexpectLibrary(object):
    NGC_TESTS_TIMEOUT_LIMIT = 1800
    IS_WINDOWS = platform.system() == 'Windows'
    SCRIPT_FOLDER = 'vCenterForWindows' if IS_WINDOWS else 'VCSA'
    SCRIPT_EXT = '.bat' if IS_WINDOWS else '.sh'
    FLEX_UIA_PATH = os.path.realpath(os.path.join(os.path.dirname(
        __file__), '..', '..', '..', 'flex', 'vic-uia'))
    INSTALLER_PATH = os.path.realpath(os.path.join(os.path.dirname(
        __file__), '..', '..', '..', 'scripts', SCRIPT_FOLDER))

    def _prepare_and_spawn(self, operation, callback=None, flags=None, timeout_sec=180):
        try:
            executable = os.path.join(
                VicUiInstallPexpectLibrary.INSTALLER_PATH, operation + VicUiInstallPexpectLibrary.SCRIPT_EXT + ' ' + (flags if flags is not None else ''))
            self._f = open(operation + '.log', 'wb')
            if VicUiInstallPexpectLibrary.IS_WINDOWS:
                self._pchild = pexpect.popen_spawn.PopenSpawn(
                    'cmd /c "cd ' + VicUiInstallPexpectLibrary.INSTALLER_PATH + ' && ' + operation + ' ' + (flags if flags is not None else '') + '"', timeout=timeout_sec)
            else:
                self._pchild = pexpect.spawn(
                    executable, cwd=VicUiInstallPexpectLibrary.INSTALLER_PATH, timeout=timeout_sec)
            self._pchild.logfile = self._f
            if callback is not None:
                callback()
            self._f.close()

        except IOError as e:
            return 'Error: ' + e.value

    def _common_prompts(
            self, vcenter_ip, vcenter_user, vcenter_password,
            trust_fingerprint, manual_entry):
        self._pchild.expect('Enter FQDN or IP to target vCenter Server: ')
        self._pchild.sendline(vcenter_ip)
        self._pchild.expect('Enter your vCenter Administrator Username: ')
        self._pchild.sendline(vcenter_user)
        self._pchild.expect('Enter your vCenter Administrator Password: ')
        self._pchild.sendline(vcenter_password)

    def script_fails_for_missing_config_or_manifest(self, script_name):
        def commands():
            self._pchild.expect('.*Error.*')
            self._pchild.expect(pexpect.EOF)
        self._prepare_and_spawn(script_name, commands, None, 5)

    def interact_with_script(
        self, script_name, flags, expected_message='', accept_fingerprint=False, continue_upgrade=None):
        def commands():
            self._pchild.expect('.*' + (expected_message + '.*' if expected_message else ''))
            if accept_fingerprint:
                self._pchild.sendline('yes')
                if continue_upgrade is not None:
                    self._pchild.expect(['.*Do you want to install.*', '.*Are you sure you want to continue.*'])
                    self._pchild.send('yes\r\n' if continue_upgrade else 'no\r\n')
                self._pchild.expect(pexpect.EOF)
        self._prepare_and_spawn(script_name, commands, flags)

    def install_fails(
            self, vcenter_ip, vcenter_user, vcenter_password,
            trust_fingerprint=True, manual_entry=None):
        def commands():
            self._common_prompts(
                vcenter_ip, vcenter_user, vcenter_password, trust_fingerprint, manual_entry)
            # self._pchild.interact()
            idx = self._pchild.expect([
                '.*Are you sure you trust the authenticity of this host (yes/no)?.*', '.*Error.*'])
            if idx is 1:
                self._pchild.expect(pexpect.EOF)
            else:
                if trust_fingerprint is True:
                    self._pchild.sendline('yes')
                else:
                    self._pchild.sendline('no')
                    self._pchild.expect(
                        '.*Enter SHA-1 thumbprint of target VC:.*')
                    self._pchild.sendline(manual_entry)

                self._pchild.expect('.*Error.*')
                self._pchild.expect(pexpect.EOF)

        self._prepare_and_spawn('install', commands)

    def install_plugin_successfully(
            self, vcenter_ip, vcenter_user, vcenter_password,
            trust_fingerprint=True, manual_entry=None, force=False):
        def commands():
            self._common_prompts(
                vcenter_ip, vcenter_user, vcenter_password, trust_fingerprint, manual_entry)
            self._pchild.expect(
                '.*Are you sure you trust the authenticity of this host (yes/no)?.*')
            self._pchild.sendline('yes')
            self._pchild.expect('.*Exited successfully')
            self._pchild.expect(pexpect.EOF)

        if force is True:
            self._prepare_and_spawn('install', commands, '-f')
        else:
            self._prepare_and_spawn('install', commands)

    def uninstall_fails(
            self, vcenter_ip, vcenter_user, vcenter_password,
            trust_fingerprint=True, manual_entry=None):
        def commands():
            self._common_prompts(
                vcenter_ip, vcenter_user, vcenter_password, trust_fingerprint, manual_entry)
            # self._pchild.interact()
            idx = self._pchild.expect([
                '.*Are you sure you trust the authenticity of this host (yes/no)?.*', '.*Error.*'])
            if idx is 1:
                self._pchild.expect(pexpect.EOF)
            else:
                if trust_fingerprint is True:
                    self._pchild.sendline('yes')
                else:
                    self._pchild.sendline('no')
                    self._pchild.expect(
                        '.*Enter SHA-1 thumbprint of target VC:.*')
                    self._pchild.sendline(manual_entry)

                self._pchild.expect('.*Error.*')
                self._pchild.expect(pexpect.EOF)

        self._prepare_and_spawn('uninstall', commands)

    def interact_with_upgrade_sh(
            self, vcenter_ip, vcenter_user, vcenter_password,
            trust_fingerprint=True, manual_entry=None):
        def commands():
            self._common_prompts(
                vcenter_ip, vcenter_user, vcenter_password, trust_fingerprint, manual_entry)
            # self._pchild.interact()
            idx = self._pchild.expect([
                '.*Are you sure you trust the authenticity of this host (yes/no)?.*', '.*Error.*'])
            if idx is 1:
                self._pchild.expect(pexpect.EOF)
            else:
                if trust_fingerprint is True:
                    self._pchild.sendline('yes')
                else:
                    self._pchild.sendline('no')
                    self._pchild.expect(
                        '.*Enter SHA-1 thumbprint of target VC:.*')
                    self._pchild.sendline(manual_entry)

                idx2 = self._pchild.expect([
                    '.*Are you sure you want to continue.*', '.*Do you want to install.*', '.*Error.*'])
                if idx2 is 2:
                    self._pchild.expect(pexpect.EOF)
                else:
                    self._pchild.sendline('yes')
                    self._pchild.expect(pexpect.EOF)

        self._prepare_and_spawn('upgrade', commands)

    def uninstall_vicui(
            self, vcenter_ip, vcenter_user, vcenter_password,
            trust_fingerprint=True, manual_entry=None):
        def commands():
            self._common_prompts(
                vcenter_ip, vcenter_user, vcenter_password, trust_fingerprint, manual_entry)
            self._pchild.expect(
                '.*Are you sure you trust the authenticity of this host (yes/no)?.*')
            self._pchild.sendline('yes')
            self._pchild.expect(
                ['.*Exited successfully', 'Error! Could not unregister.*'])
            # self._pchild.interact()
            self._pchild.expect(pexpect.EOF)

        self._prepare_and_spawn('uninstall', commands)

    def run_ngc_tests(self, vcenter_user, vcenter_password, working_directory):
        try:
            self._f = open('ngc_tests.log', 'wb')
            self._pchild = pexpect.spawn('mvn test -Dmaven.repo.local=' + working_directory + ' -Denv.VC_ADMIN_USERNAME=' + vcenter_user + ' -Denv.VC_ADMIN_PASSWORD=' + vcenter_password,
                                         cwd=VicUiInstallPexpectLibrary.FLEX_UIA_PATH, timeout=VicUiInstallPexpectLibrary.NGC_TESTS_TIMEOUT_LIMIT)
            self._pchild.logfile = self._f
            self._pchild.expect(pexpect.EOF)
            self._f.close()

        except IOError as e:
            return 'Error: ' + e.value

    def run_hsuia_tests(self, working_directory):
        try:
            self._f = open('ngc_tests.log', 'wb')
            self._pchild = pexpect.spawn('java -cp "' + working_directory + '/*" com.vmware.vsphere.client.automation.runner.BatchCommandRunner ' +
                working_directory + '/runlists/default.runlist',
                cwd=working_directory,
                timeout=VicUiInstallPexpectLibrary.NGC_TESTS_TIMEOUT_LIMIT)
            self._pchild.logfile = self._f
            self._pchild.expect(pexpect.EOF)
            self._f.close()

        except IOError as e:
            return 'Error: ' + e.value
