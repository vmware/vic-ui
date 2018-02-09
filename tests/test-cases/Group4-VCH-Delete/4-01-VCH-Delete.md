Test 4-01 - VCH Delete
=======

# Purpose:
To verify that a VCH is able to be deleted from the VIC UI Plugin

# References:

# Environment:
This test requires that a vSphere server is running and available, VIC UI is installed,
and a VCH has been successfully installed

# Test Steps:
1. Navigate to the list of VCH's
2. Click the left most auxiliary menu in the VCH list
3. Click 'Delete VCH' button to open VCH delete Modal
4. Click the box to remove all volumes associated
5. Click 'Delete'

# Expected Outcome:
* The VCH and associated volumes should not be present in the VC inventory

# Possible Problems:
API errors returned

