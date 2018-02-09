Test 1-03 - VIC UI Upgrade
======

#Purpose:
To test all possible upgrade failures and success scenarios on VCSA

#References:
1.4 UI version mockup:
https://vmware.invisionapp.com/d/main#/console/11338635/268527691/preview

#Environment:
* Testing VIC UI requires a working VCSA setup with VCH installed

#Test Steps (script):
1. Script should fail when run without `configs` file
2. Script should fail when run `plugin-manifest` file
3. When run, the script should ask for VC IP first
4. When run with VC IP provided as an argument, the script should ask for VC admin username
5. When run with VC IP and admin username as arguments, the script should ask for VC admin password
6. When run with all VC connection information, the script should prompt the user to verify the VC thumbprint
7. When an environment variable `VIC_MACHINE_THUMBPRINT` is set, the script should still be able to fetch the VC thumbprint
8. Script should fail when the user attempts to install the plugin against a non vCenter host
9. Script should fail when the user attempts to pass wrong vCenter admin credentials
10. [Unix-like OS only] Script should fail when the user provides a wrong VC thumbprint
11. [Unix-like OS only] Script should fail when the URL to the plugin bundles on VIC appliance is incorrect
12. When the plugins are not yet installed, the script should warn the user if s/he wants to install them
13. When the plugins are already installed, the script should warn the user if s/he wants to upgrade them

#Expected Outcome:
* Each step should return success

#Possible Problems:
Returns error on mismatch of VIC Plugin versions

#Test Steps (UI version) WIP:
1. Navigate to Configuration tab of OVA appliance portal (adjacent to Getting Started tab).
2. Click 'Upgrade VIC'
3. Enter required fields
4. Click Upgrade
5. Verify VIC has been upgraded (TBD)

#Expected Outcome:
* API should return success message of successful upgrade

#Possible Problems:
API Error returned
