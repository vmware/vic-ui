Test 5-15 - NFS Datastore
=======

# Purpose:
To verify that VIC OVA and Wizard UI works properly when installed on an NFS based datastore

# References:
[1 - Best practices for running VMware vSphere on NFS](http://www.vmware.com/content/dam/digitalmarketing/vmware/en/pdf/techpaper/vmware-nfs-bestpractices-white-paper-en.pdf)

# Environment:
This test requires access to VMware Nimbus cluster for dynamic ESXi and vCenter creation

# Test Steps:
1. Deploy a new vCenter with a simple cluster
2. Deploy an NFS server
3. Create a new datastore out of a NFS share on the NFS server
4. Install the VIC OVA appliance into one of the datacenters
5. Run regression tests on the VIC OVA appliance and Wizard UI

# Expected Outcome:
The VIC OVA appliance should deploy without error and regression tests should pass

# Possible Problems:
None
