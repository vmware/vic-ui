Test 5-04 - Multiple Cluster
=======

# Purpose:
To verify the VIC OVA appliance and Wizard UI works when the vCenter appliance has multiple clusters within the datacenter

# References:
[1 - VMware vCenter Server Availability Guide](http://www.vmware.com/files/pdf/techpaper/vmware-vcenter-server-availability-guide.pdf)

# Environment:
This test requires access to VMware Nimbus cluster for dynamic ESXi and vCenter creation

# Test Steps:
1. Deploy a new vCenter with 3 different clusters in a datacenter and a mix of ESX within the clusters
2. Install the VIC OVA appliance into one of the clusters
3. Run regression tests on the VIC OVA appliance and Wizard UI

# Expected Outcome:
The VIC OVA appliance should deploy without error and regression tests should pass

# Possible Problems:
None
