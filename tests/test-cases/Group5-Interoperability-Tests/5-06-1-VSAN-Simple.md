Test 5-06-1 - VSAN-Simple
=======

# Purpose:
To verify the VIC OVA appliance and Wizard UI works with VMware Virtual SAN

# References:
[1 - VMware Virtual SAN](http://www.vmware.com/products/virtual-san.html)

# Environment:
This test requires access to VMWare Nimbus cluster for dynamic ESXi and vCenter creation

# Test Steps:
1. Deploy a new vCenter in Nimbus:  
```--testbedName test-vpx-4esx-virtual-fullInstall-vcva-8gbmem```  
2. Deploy VIC OVA and VCH Appliance to the new vCenter
3. Run regression tests on the VIC OVA appliance and Wizard UI

# Expected Outcome:
The VIC OVA appliance should deploy without error and regression tests should pass

# Possible Problems:
* None