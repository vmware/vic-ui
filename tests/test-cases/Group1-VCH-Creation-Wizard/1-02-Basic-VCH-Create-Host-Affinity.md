Test 1-02 - Basic VCH Lifecycle with Host Affinity Enabled
=======

# Purpose:
To verify that a basic VCH lifecycle (create, edit(tbd), delete) succeeds

# References:

# Environment:
This test requires that a vSphere server is running and available and VIC OVA with creation wizard is installed

# Test Steps:
0. Login and navigate to VIC plugin
1. Navigate to the VCH Creation Wizard
2. Click through each step of the VCH Creation Wizard using defaults in all
   cases except compute resource that you must select host affinity, datastore
   and networks that you must select the respective values and finish.
3. Verify VCH found and ready
4. Navigate to VCH in vcenter
5. Navigate to related objects and select Cluster
6. Navigate to Host Group/Virtual Machine
7. Check the VCH is present on as a Host Group / Virtual Machine
8. Navigate to VCH list
9. Delete VCH

# Expected Outcome:
* All steps should be successful

# Possible Problems:
Timeouts
Certificates (IE11)
API errors
