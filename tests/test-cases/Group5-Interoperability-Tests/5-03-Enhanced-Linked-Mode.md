Test 5-3 - Enhanced Linked Mode
=======

# Purpose:
To verify the VIC appliance and Wizard UI works in when the vCenter appliance is using enhanced linked mode

# References:
[1 - VMware vCenter Server Availability Guide](http://www.vmware.com/files/pdf/techpaper/vmware-vcenter-server-availability-guide.pdf)

# Environment:
This test requires access to VMWare Nimbus cluster for dynamic ESXi and vCenter creation

# Test Steps:
1. Deploy two new vCenters in Nimbus each with one ESXi host configured
2. Establish an enhanced link between the two vCenters
3. Install the VIC OVA appliance 
4. Run regression tests on the VIC OVA appliance and Wizard UI

# Expected Outcome:
The VIC OVA appliance should deploy without error and regression tests should pass

# Possible Problems:
None