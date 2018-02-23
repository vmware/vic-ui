Test 1-01 - Basic VCH Lifecycle
=======

# Purpose:
To verify that a basic VCH lifecycle (create, edit(tbd), delete) succeeds

# References:

# Environment:
This test requires that a vSphere server is running and available and VIC OVA with creation wizard is installed

# Test Steps:
0. Login and navigate to VIC plugin
1. Navigate to the VCH Creation Wizard
2. Click through each step of the VCH Creation Wizard using defaults in all cases except datastore and networks that you must select, and finish.
3. Verify VCH found and ready
4. Navigate to VCH in vcenter
5. Check Action menu for VIC items (create, edit, delete)
6. Click to edit (tbd)
7. Click through each step of the VCH Edit Wizard, and finish (tbd)
8. Verify VCH has been reconfigured (tbd)
9. Navigate to VCH list
10. Delete VCH

# Expected Outcome:
* All steps should be successful

# Possible Problems:
Timeouts
Certificates (IE11)
API errors
