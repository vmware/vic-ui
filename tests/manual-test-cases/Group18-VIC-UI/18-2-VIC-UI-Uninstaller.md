Test 18-2 - VIC UI Uninstallation
======

#Purpose:
To test all possible uninstallation failures and success scenarios on VCSA

#References:

#Environment:
* Testing VIC UI requires a working VCSA setup with VCH installed

#Test Steps:
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
11. [Unix-like OS only] Script should successfully uninstall the plugins
12. Script should fail when trying to uninstall the plugins already gone

#Expected Outcome:
* Each step should return success

#Possible Problems:
None