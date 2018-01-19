Test 18-4 - VIC UI Plugin Tests - Portlets
======

#Purpose:
To test functionality of Portlets of the VIC UI plugin in the vSphere Client

#References:

#Environment:
* vSphere 6.0u2 or higher for the Flex Client plugin
* vSphere 6.5d or higher for the HTML5 Client plugin

#Prerequisites:
1. Deploy a VIC product OVA to the VCSA you want to test on
2. Access the deployed appliance VM in vSphere Client console, retrieve its IP, and open the Getting Started page at https://$APPLIANCE_IP:9443 in the browser
3. Finish product installation as instructed
4. In the Getting Started page, click the "Download" button to download the VIC Engine tar ball
5. Unextract the tar ball in an arbitrary location
    ```
    user $ tar -xvf vic_v1.3.0-rc6.tar.gz -C /tmp/
    ```
6. Run the UI plugins installer
    ```
    user $ cd /tmp/vic/ui/VCSA
    user $ ./install.sh
    ```
7. As instructed by the installer script, make sure to restart the vSphere Web Client service
    ```
    user $ ssh root@tina.eng.vmware.com
    (type VCSA appliance root password)
    root@VCSA # service-control --stop vsphere-client && service-control --start vsphere-client
    ```
    If your VC version is 6.5 also restart the vSphere Client service
    ```
    root@VCSA # service-control --stop vsphere-ui && service-control --start vsphere-ui
    ```

#Test Steps:
- Flex Client plugin
  - **Note**: Test on the following platform - browser combinations
    - macOS - Chrome, Firefox
    - Windows - Chrome, Firefox, IE11
  - Test 1: Verify if the VIC UI plugin is installed correctly
    - In an SSH session or macOS Terminal, deploy a VCH using the `vic-machine` binary
      ```
      user $ cd /tmp/vic
      user $ ./vic-machine-linux create --target tina.eng.vmware.com --user administrator@vsphere.local --password Admin\!23 --name E2E-TEST-VCH --bridge-network bridge --image-store datastore1 --compute-resource Cluster --no-tlsverify --thumbprint 39:4F:92:58:9B:4A:CD:93:F3:73:8F:D2:13:1C:46:DD:4E:92:46:AB
      (take a note of the value of DOCKER_HOST from the output, as it will be used to create a container below)
      ```
    - Open the browser to navigate to https://tina.eng.vmware.com/vsphere-client
    - Log in as admin user (administrator@vsphere.local / Admin!23)
    - Navigate to Administration -> Client Plug-Ins
    - Verify if an entry named “vSphere Integrated Containers-FlexClient" exists

  - Test 2.1: Verify if VCH VM Portlet exists
    - Open the browser to navigate to https://tina.eng.vmware.com/vsphere-client
    - Log in as admin user (administrator@vsphere.local / Admin!23)
    - Navigate to the "Hosts and Clusters" page and open the Summary tab of VM "E2E-TEST-VCH"
    - Verify the visibility of portlet "Virtual Container Host"

  - Test 2.2: Verify if VCH VM Portlet displays correct information while VM is OFF
    - Open the browser to navigate to https://tina.eng.vmware.com/vsphere-client
    - Log in as admin user (administrator@vsphere.local / Admin!23)
    - Navigate to the "Hosts and Clusters" page and open the Summary tab of VM "E2E-TEST-VCH"
    - Power off the VM
    - Verify in the "Virtual Container Host" portlet if "Docker API endpoint" equals `-`

  - Test 2.3: Verify if VCH VM Portlet displays correct information while VM is ON
    - Open the browser to navigate to https://tina.eng.vmware.com/vsphere-client
    - Log in as admin user (administrator@vsphere.local / Admin!23)
    - Navigate to the "Hosts and Clusters" page and open the Summary tab of VM "E2E-TEST-VCH"
    - Power off the VM
    - Verify in the "Virtual Container Host" portlet if "Docker API endpoint" displays the correct connection information

  - Test 3: Verify if Container VM Portlet exists
    - In an SSH session or macOS Terminal, create a busybox container on the VCH created in a previous step
      ```
      user $ docker -H #.#.#.#:2376 --tls run -itd busybox /bin/top
      ```
    - Open the browser to navigate to https://tina.eng.vmware.com/vsphere-client
    - Log in as admin user (administrator@vsphere.local / Admin!23)
    - Navigate to the "Hosts and Clusters" page and open the Summary tab of the container VM that just got created
    - Verify the visibility of portlet "Container"

  - Cleanup: Destroy VCH and Container VM
    - In an SSH session or macOS Terminal, delete the VCH and its Container VMs using the `vic-machine` binary
      ```
      ./vic-machine-linux delete --target tina.eng.vmware.com --user administrator@vsphere.local --password Admin\!23 --name E2E-TEST-VCH --compute-resource Cluster --thumbprint 39:4F:92:58:9B:4A:CD:93:F3:73:8F:D2:13:1C:46:DD:4E:92:46:AB --force
      ```
- HTML5 Client plugin
  - Test cases for the H5 Client plugin are basically identical to those of the Flex Client plugin except there are some more cases to test the visibility of the shortcut icon to the vSphere Integrated Containers page in the H5 Client and basic navigation.


#Expected Outcome:
* All tests should be successful
