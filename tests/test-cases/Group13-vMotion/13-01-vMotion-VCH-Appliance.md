Test 13-01 vMotion VCH Appliance
=======

# Purpose:
To verify the VCH appliance created using wizard UI continues to function properly after being vMotioned to a new host

# References:
[1- vMotion A Powered On Virtual Machine](http://pubs.vmware.com/vsphere-4-esx-vcenter/index.jsp?topic=/com.vmware.vsphere.dcadmin.doc_41/vsp_dc_admin_guide/migrating_virtual_machines/t_migrate_a_powered-on_virtual_machine_with_vmotion.html)

# Environment:
This test requires that a vCenter server is running and available

# Test Steps:
1. Install a new VCH appliance using wizard UI onto one of the hosts within the vCenter server
2. While the VCH appliance is powered on, vMotion the VCH appliance to a new host
3. Run a variety of docker commands on the VCH appliance after it has moved
4. Delete the VCH appliance
5. Install a new VCH appliance using wizard UI onto on the hosts within the vCenter server
6. Create several containers on the new VCH appliance that are in the following states: created but not started, started and running, started and stopped, stopped after running and being attached to, running after being attached to but currently not attached to, running and currently attached to
7. vMotion the VCH appliance to a new host
8. Complete the life cycle of the containers created in Step 11, including getting docker logs and re-attaching to containers that are running

# Expected Outcome:
In each scenario, the VCH appliance should continue to work as expected after being vMotioned and all docker commands should return without error

# Possible Problems:
None