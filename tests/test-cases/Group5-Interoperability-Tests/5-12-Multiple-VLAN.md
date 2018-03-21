Test 5-12 - Multiple VLAN
=======

# Purpose:
To verify the VIC OVA appliance and Wizard UI works when the vCenter appliance has multiple portgroups on different VLANs within the datacenter

# References:
[1 - VMware vCenter Server Availability Guide](http://www.vmware.com/files/pdf/techpaper/vmware-vcenter-server-availability-guide.pdf)

# Environment:
This test requires access to VMware Nimbus cluster for dynamic ESXi and vCenter creation

# Test Steps:
1. Deploy a new vCenter with a distributed virtual switch with 3 portgroups on all different VLANs
2. Install the VIC appliance into one of the clusters
3. Run regression tests on the VIC OVA appliance and Wizard UI
4. Uninstall the VIC appliance
5. Deploy a new vCenter with a distributed virtual switch with 3 portgroups two on the same VLAN and one on a different VLAN
6. Install the VIC appliance into one of the clusters
7. Run regression tests on the VIC OVA appliance and Wizard UI

# Expected Outcome:
The VIC OVA appliance should deploy without error and regression tests should pass

# Possible Problems:
None
