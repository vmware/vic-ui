/*

Copyright 2017 VMware, Inc. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

 */
package com.vmware.vic;

import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.HttpsURLConnection;
import javax.xml.ws.BindingProvider;
import javax.xml.ws.handler.MessageContext;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import com.vmware.utils.ssl.ThumbprintHostNameVerifier;
import com.vmware.utils.ssl.ThumbprintTrustManager;
import com.vmware.vic.model.ContainerVm;
import com.vmware.vic.model.VirtualContainerHostVm;
import com.vmware.vic.model.constants.BaseVm;
import com.vmware.vic.model.constants.Container;
import com.vmware.vic.model.constants.Vch;
import com.vmware.vic.model.constants.VsphereObjects;
import com.vmware.vim25.DynamicProperty;
import com.vmware.vim25.InvalidPropertyFaultMsg;
import com.vmware.vim25.ManagedObjectReference;
import com.vmware.vim25.NotFoundFaultMsg;
import com.vmware.vim25.ObjectContent;
import com.vmware.vim25.ObjectSpec;
import com.vmware.vim25.OptionValue;
import com.vmware.vim25.PropertyFilterSpec;
import com.vmware.vim25.PropertySpec;
import com.vmware.vim25.RetrieveOptions;
import com.vmware.vim25.RetrieveResult;
import com.vmware.vim25.RuntimeFaultFaultMsg;
import com.vmware.vim25.ServiceContent;
import com.vmware.vim25.TraversalSpec;
import com.vmware.vim25.UserSearchResult;
import com.vmware.vim25.VimPortType;
import com.vmware.vim25.VimService;
import com.vmware.vim25.VirtualMachineConfigInfo;
import com.vmware.vise.data.query.PropertyValue;
import com.vmware.vise.data.query.ResultItem;
import com.vmware.vise.security.ClientSessionEndListener;
import com.vmware.vise.usersession.ServerInfo;
import com.vmware.vise.usersession.UserSession;
import com.vmware.vise.usersession.UserSessionService;
import com.vmware.vise.vim.data.VimObjectReferenceService;

public class PropFetcher implements ClientSessionEndListener {
    private static final Log _logger = LogFactory.getLog(PropFetcher.class);
    private static VimPortType _vimPort = initializeVimPort();
    private static final String[] VIC_VM_TYPES = {"isVCH", "isContainer"};
    private static final String SERVICE_INSTANCE = "ServiceInstance";
    private static final Set<String> _thumbprints = new HashSet<String>();
    private static final String[] VM_PROPERTIES_TO_FETCH = new String[]{
            BaseVm.VM_NAME, BaseVm.Config.VM_GUESTFULLNAME,
            BaseVm.Config.VM_EXTRACONFIG, BaseVm.VM_OVERALL_STATUS,
            BaseVm.VM_SUMMARY, BaseVm.VM_RESOURCECONFIG,
            BaseVm.VM_RESOURCEPOOL, BaseVm.Runtime.VM_POWERSTATE_FULLPATH
    };
    private static final String VM_GUESTNAME_VCH_IDENTIFIER = "Photon - VCH";
    private static final String[] VM_GUESTNAME_CONTAINER_IDENTIFIER =
            new String[]{
                    "Photon - Container", "Redhat - Container", "Windows - Container"};
    private static final String GROUP_ADMINISTRATORS = "Administrators";
    private final UserSessionService _userSessionService;
    private final VimObjectReferenceService _vimObjectReferenceService;
    private Object _rpMorValueToVchLock = new Object();
    private Map<String, String> _rpMorValueVchEndpointNameMap = new HashMap<String, String>();
    private Map<String, String> _rpMorValueVchMorValueMap = new HashMap<String, String>();

    private static VimPortType initializeVimPort() {
        VimService vimService = new VimService();
        return vimService.getVimPort();
    }

    static {
        HostnameVerifier hostNameVerifier = new ThumbprintHostNameVerifier();
        HttpsURLConnection.setDefaultHostnameVerifier(hostNameVerifier);

        javax.net.ssl.TrustManager[] tms = new javax.net.ssl.TrustManager[1];
        javax.net.ssl.TrustManager tm = new ThumbprintTrustManager();
        tms[0] = tm;
        javax.net.ssl.SSLContext sc = null;

        try {
            sc = javax.net.ssl.SSLContext.getInstance("SSL");
        } catch (NoSuchAlgorithmException e) {
            _logger.error(e);
        }

        javax.net.ssl.SSLSessionContext sslsc = sc.getServerSessionContext();
        sslsc.setSessionTimeout(0);
        try {
            sc.init(null, tms, null);
        } catch (KeyManagementException e) {
            _logger.error(e);
        }
        javax.net.ssl.HttpsURLConnection.setDefaultSSLSocketFactory(
                sc.getSocketFactory());
    }

    public PropFetcher(
            UserSessionService userSessionService,
            VimObjectReferenceService vimObjectReferenceService) {
        if (userSessionService == null ||
                vimObjectReferenceService == null) {
            throw new IllegalArgumentException("constructor argument cannot be null");
        }
        _userSessionService = userSessionService;
        _vimObjectReferenceService = vimObjectReferenceService;
    }

    /**
     * Look up the current session user in UserDirectory
     * and check if the user belongs to the vSphere administrators group
     * @return true if admin
     */
    public boolean isSessionUserVsphereAdmin() {
        ServerInfo[] sInfos = _userSessionService.getUserSession().serversInfo;
        String login = _userSessionService.getUserSession().userName;
        String[] loginSplit = login.split("@");
        String userName = loginSplit[0];
        String domain = "";
        if (loginSplit.length > 1) {
            domain = loginSplit[1];
        }

        for (ServerInfo sInfo : sInfos) {
            if (sInfo.serviceGuid != null) {
                String serverGuid = sInfo.serviceGuid;
                ServiceContent service = getServiceContent(serverGuid);
                if (service == null) {
                    _logger.error("Failed to retrieve ServiceContent!");
                    return false;
                }

                try {
                    List<UserSearchResult> userSrchResults = _vimPort.retrieveUserGroups(
                            service.getUserDirectory(),
                            domain,
                            userName,
                            GROUP_ADMINISTRATORS,
                            null, true, true, false);

                    return userSrchResults.size() == 1;
                } catch (NotFoundFaultMsg e) {
                    _logger.warn(e.getMessage());
                } catch (RuntimeFaultFaultMsg e) {
                    _logger.error(e.getMessage());
                }
            }
        }
        return false;
    }

    /**
     * Get VIC VMs
     * @param isVch : true for VCHs and false for Container VMs
     * @return ResultItem object containing either VCH VM(s) or Container VM(s)
     *         based on the isVch boolean value
     */
    public ResultItem getVicVms(boolean isVch) {
        List<PropertyValue> pvList = new ArrayList<PropertyValue>();
        ResultItem resultItem = new ResultItem();

        ServerInfo[] sInfos = _userSessionService.getUserSession().serversInfo;
        // get VMs for every linked VC
        for (ServerInfo sInfo : sInfos) {
            if (sInfo.serviceGuid != null) {
                String serviceGuid = sInfo.serviceGuid;
                ServiceContent service = getServiceContent(serviceGuid);
                if (service == null) {
                    _logger.error("Failed to retrieve ServiceContent!");
                    return null;
                }

                ManagedObjectReference viewMgrRef = service.getViewManager();
                List<String> vmList = new ArrayList<String>();
                vmList.add(VsphereObjects.VirtualMachine);
                try {
                    ManagedObjectReference cViewRef = _vimPort.createContainerView(
                            viewMgrRef,
                            service.getRootFolder(),
                            vmList,
                            true);

                    PropertySpec propertySpec = new PropertySpec();
                    propertySpec.setType(VsphereObjects.VirtualMachine);
                    List<String> pSpecPathSet = propertySpec.getPathSet();
                    for (String vmProp : VM_PROPERTIES_TO_FETCH) {
                        pSpecPathSet.add(vmProp);
                    }

                    PropertySpec propertySpecRp = new PropertySpec();
                    propertySpecRp.setType(VsphereObjects.ResourcePool);
                    List<String> pSpecPathSetRp = propertySpecRp.getPathSet();
                    pSpecPathSetRp.add(VsphereObjects.NamePropertyKey);
                    pSpecPathSetRp.add(VsphereObjects.VmPropertyValueKey);

                    // set the root traversal spec
                    TraversalSpec tSpec = new TraversalSpec();
                    tSpec.setName("traverseEntities");
                    tSpec.setPath("view");
                    tSpec.setSkip(false);
                    tSpec.setType("ContainerView");

                    // add traversal spec for VirtualMachine->ResourcePool
                    TraversalSpec vmRpTraversalSpec = new TraversalSpec();
                    vmRpTraversalSpec.setName("traverseResourcePool");
                    vmRpTraversalSpec.setPath("resourcePool");
                    vmRpTraversalSpec.setSkip(false);
                    vmRpTraversalSpec.setType(VsphereObjects.VirtualMachine);
                    tSpec.getSelectSet().add(vmRpTraversalSpec);

                    TraversalSpec rpVmTraversalSpec = new TraversalSpec();
                    rpVmTraversalSpec.setName("traversalRpVm");
                    rpVmTraversalSpec.setPath(VsphereObjects.VmPropertyValueKey);
                    rpVmTraversalSpec.setSkip(false);
                    rpVmTraversalSpec.setType(VsphereObjects.ResourcePool);
                    vmRpTraversalSpec.getSelectSet().add(rpVmTraversalSpec);

                    // set objectspec and attach the root traversal spec
                    ObjectSpec objectSpec = new ObjectSpec();
                    objectSpec.setObj(cViewRef);
                    objectSpec.setSkip(Boolean.TRUE);
                    objectSpec.getSelectSet().add(tSpec);

                    PropertyFilterSpec propertyFilterSpec = new PropertyFilterSpec();
                    propertyFilterSpec.getPropSet().add(propertySpec);
                    propertyFilterSpec.getPropSet().add(propertySpecRp);
                    propertyFilterSpec.getObjectSet().add(objectSpec);

                    List<PropertyFilterSpec> propertyFilterSpecs = new ArrayList<PropertyFilterSpec>();
                    propertyFilterSpecs.add(propertyFilterSpec);
                    RetrieveOptions ro = new RetrieveOptions();

                    RetrieveResult props = _vimPort.retrievePropertiesEx(
                            service.getPropertyCollector(),
                            propertyFilterSpecs,
                            ro);
                    if (props != null) {
                        for (ObjectContent objC : props.getObjects()) {
                            List<DynamicProperty> dpList = objC.getPropSet();
                            String objType = objC.getObj().getType();
                            String objMorValue = objC.getObj().getValue();
                            boolean isVicVm = false;

                            // if it's a VCH VM, store its resourcePool MOR value and the VM's MOR value in
                            // rpMorValueTovchMorValue map

                            if (objType.equals(VsphereObjects.VirtualMachine)) {
                                // process VirtualMachine by looking for
                                // config.guestFullName to determine if the VM is
                                // the desired VIC VM. if so, then set flag isVicVm to
                                // true such that this VirtualMachine object will be
                                // processed to be returned in the ResultItem object
                                boolean isVchEndpoint = false;
                                String resourcePoolMorValue = null;
                                String vmName = null;
                                String vmMorValue = objMorValue;

                                for (DynamicProperty dp : dpList) {
                                    if (dp.getName().equals(
                                            BaseVm.Config.VM_GUESTFULLNAME)) {
                                        String guestName = ((String)dp.getVal());
                                        if (isVch) {
                                            isVicVm = guestName.contains(
                                                    VM_GUESTNAME_VCH_IDENTIFIER);
                                            isVchEndpoint = isVicVm;
                                        } else {
                                            for (String contId :
                                                VM_GUESTNAME_CONTAINER_IDENTIFIER) {
                                                if (guestName.contains(contId)) {
                                                    isVicVm = true;
                                                    break;
                                                }
                                            }
                                        }
                                    } else if (dp.getName().equals(
                                            BaseVm.VM_NAME)) {
                                        vmName = (String)dp.getVal();
                                    } else if (dp.getName().equals(
                                            BaseVm.VM_RESOURCEPOOL)) {
                                        ManagedObjectReference mor = (ManagedObjectReference)dp.getVal();
                                        resourcePoolMorValue = mor.getValue();
                                    }
                                }

                                if (isVchEndpoint) {
                                    synchronized (_rpMorValueToVchLock) {
                                        // if this is a VCH VM, put the the following information into maps:
                                        // 1. parent resourcePool's MOR value - endpoint VM's name
                                        // 2. parent resourcePool's MOR value - endpoint VM's MOR value
                                        _rpMorValueVchEndpointNameMap.put(resourcePoolMorValue, vmName);
                                        _rpMorValueVchMorValueMap.put(resourcePoolMorValue, vmMorValue);
                                    }
                                }
                            }

                            // if this ObjectContent is indeed either a VCH VM or a
                            // Container VM then create an instance of its class and
                            // add it to the array list
                            if (isVicVm) {
                                PropertyValue pv = new PropertyValue();
                                pv.propertyName = VsphereObjects.VmPropertyValueKey;
                                if (isVch) {
                                    pv.value = new VirtualContainerHostVm(
                                            objC, serviceGuid);
                                } else {
                                    pv.value = new ContainerVm(
                                            objC, serviceGuid);
                                }
                                pvList.add(pv);
                                continue;
                            }
                        }

                        // if requesting Container VMs, get the name of its
                        // parent ResourcePool or VirtualApp for each
                        if (!isVch) {
                            for (PropertyValue pv : pvList) {
                                // for each container vm, get the parent object's
                                // name from vcValueRpNameMap
                                ContainerVm cvm = (ContainerVm)pv.value;
                                ManagedObjectReference parentRpMor = (ManagedObjectReference)cvm.getResourcePool();
                                String nameOfParent = _rpMorValueVchEndpointNameMap.get(parentRpMor.getValue());
                                String morValueOfVchEndpointVm = _rpMorValueVchMorValueMap.get(parentRpMor.getValue());
                                cvm.setVchEndpointVmMorValue(morValueOfVchEndpointVm);
                                cvm.setParentName(nameOfParent);
                            }
                        }
                    }
                } catch (InvalidPropertyFaultMsg e) {
                    _logger.error(e);
                } catch (RuntimeFaultFaultMsg e) {
                    _logger.error(e);
                }
            }
        }

        resultItem.properties = pvList.toArray(new PropertyValue[]{});
        return resultItem;
    }

    /**
     * Get VMs belonging to a given vApp object reference.
     * @param objRef
     * @param isVch
     * @return ResultItem object containing either VCH VM(s) or Container VM(s)
     *         based on the isVch boolean value
     * @throws InvalidPropertyFaultMsg
     * @throws RuntimeFaultFaultMsg
     */
    public ResultItem getVmsBelongingToMor(Object objRef, boolean isVch)
            throws InvalidPropertyFaultMsg, RuntimeFaultFaultMsg {
        List<PropertyValue> pvList = new ArrayList<PropertyValue>();
        ResultItem resultItem = new ResultItem();
        resultItem.resourceObject = objRef;

        String entityType = _vimObjectReferenceService.getResourceObjectType(objRef);
        String entityName = _vimObjectReferenceService.getValue(objRef);
        String serverGuid = _vimObjectReferenceService.getServerGuid(objRef);

        ManagedObjectReference mor = new ManagedObjectReference();
        mor.setType(entityType);
        mor.setValue(entityName);

        ServiceContent service = getServiceContent(serverGuid);
        if (service == null) {
            _logger.error("Failed to retrieve ServiceContent!");
            return null;
        }

        ManagedObjectReference viewMgrRef = service.getViewManager();
        List<String> vmList = new ArrayList<String>();
        vmList.add(VsphereObjects.VirtualMachine);
        ManagedObjectReference cViewRef = _vimPort.createContainerView(
                viewMgrRef,
                mor,
                vmList,
                true);

        PropertySpec propertySpec = new PropertySpec();
        propertySpec.setType(VsphereObjects.VirtualMachine);
        List<String> pSpecPathSet = propertySpec.getPathSet();
        pSpecPathSet.add(BaseVm.VM_NAME);
        pSpecPathSet.add(BaseVm.VM_SUMMARY);
        pSpecPathSet.add(BaseVm.VM_OVERALL_STATUS);
        pSpecPathSet.add(BaseVm.Runtime.VM_POWERSTATE_FULLPATH);
        pSpecPathSet.add(BaseVm.Config.VM_EXTRACONFIG);

        // set the root traversal spec
        TraversalSpec tSpec = new TraversalSpec();
        tSpec.setName("traverseEntities");
        tSpec.setPath("view");
        tSpec.setSkip(false);
        tSpec.setType("ContainerView");

        // set objectspec and attach the root traversal spec
        ObjectSpec objectSpec = new ObjectSpec();
        objectSpec.setObj(cViewRef);
        objectSpec.setSkip(Boolean.TRUE);
        objectSpec.getSelectSet().add(tSpec);

        // set traversal node for VirtualApp->VirtualMachine
        TraversalSpec tSpecVappVm = new TraversalSpec();
        tSpecVappVm.setType(VsphereObjects.VirtualApp);
        tSpecVappVm.setPath(VsphereObjects.VmPropertyValueKey);
        tSpecVappVm.setSkip(false);
        tSpec.getSelectSet().add(tSpecVappVm);

        PropertyFilterSpec propertyFilterSpec = new PropertyFilterSpec();
        propertyFilterSpec.getPropSet().add(propertySpec);
        propertyFilterSpec.getObjectSet().add(objectSpec);

        List<PropertyFilterSpec> propertyFilterSpecs = new ArrayList<PropertyFilterSpec>();
        propertyFilterSpecs.add(propertyFilterSpec);
        RetrieveOptions ro = new RetrieveOptions();

        RetrieveResult props = _vimPort.retrievePropertiesEx(
                service.getPropertyCollector(),
                propertyFilterSpecs,
                ro);
        if (props != null) {
            for (ObjectContent objC : props.getObjects()) {
                // each managed object reference found will be added to resultItem.properties
                PropertyValue pv = new PropertyValue();
                pv.propertyName = VsphereObjects.VmPropertyValueKey;
                if (isVch) {
                    pv.value = new VirtualContainerHostVm(objC, serverGuid);
                } else {
                    pv.value = new ContainerVm(objC, serverGuid);
                }

                pvList.add(pv);
            }
        }
        resultItem.properties = pvList.toArray(new PropertyValue[]{});

        return resultItem;
    }

    /**
     * Compute custom VM properties isContainer and isVCH
     * @param objRef
     * @return ResultItem object containing PropertyValue[] for the
     *         the custom VM properties
     * @throws InvalidPropertyFaultMsg
     * @throws RuntimeFaultFaultMsg
     */
    public ResultItem getVmProperties(Object objRef) throws
    InvalidPropertyFaultMsg, RuntimeFaultFaultMsg {
        ResultItem resultItem = new ResultItem();
        resultItem.resourceObject = objRef;
        String entityType = _vimObjectReferenceService.getResourceObjectType(objRef);
        String entityName = _vimObjectReferenceService.getValue(objRef);
        String serverGuid = _vimObjectReferenceService.getServerGuid(objRef);

        ManagedObjectReference vmMor = new ManagedObjectReference();
        vmMor.setType(entityType);
        vmMor.setValue(entityName);

        VirtualMachineConfigInfo config = null;

        // initialize properties isVCH and isContainer
        PropertyValue pv_is_vch = new PropertyValue();
        pv_is_vch.resourceObject = objRef;
        pv_is_vch.propertyName = VIC_VM_TYPES[0];
        pv_is_vch.value = false;

        PropertyValue pv_is_container = new PropertyValue();
        pv_is_container.resourceObject = objRef;
        pv_is_container.propertyName = VIC_VM_TYPES[1];
        pv_is_container.value = false;

        ServiceContent service = getServiceContent(serverGuid);
        if (service == null) {
            _logger.error("Failed to retrieve ServiceContent!");
            return null;
        }

        PropertySpec propertySpec = new PropertySpec();
        propertySpec.setAll(Boolean.FALSE);
        propertySpec.setType(VsphereObjects.VirtualMachine);
        propertySpec.getPathSet().add("config");

        ObjectSpec objectSpec = new ObjectSpec();
        objectSpec.setObj(vmMor);
        objectSpec.setSkip(Boolean.FALSE);

        PropertyFilterSpec propertyFilterSpec = new PropertyFilterSpec();
        propertyFilterSpec.getPropSet().add(propertySpec);
        propertyFilterSpec.getObjectSet().add(objectSpec);

        List<PropertyFilterSpec> propertyFilterSpecs = new ArrayList<PropertyFilterSpec>();
        propertyFilterSpecs.add(propertyFilterSpec);

        List<ObjectContent> objectContents = _vimPort.retrieveProperties(service.getPropertyCollector(), propertyFilterSpecs);
        if (objectContents != null) {
            for (ObjectContent content : objectContents) {
                List<DynamicProperty> dps = content.getPropSet();
                if (dps != null) {
                    for (DynamicProperty dp : dps) {
                        config = (VirtualMachineConfigInfo) dp.getVal();

                        List<OptionValue> extraConfigs = config.getExtraConfig();
                        for(OptionValue option : extraConfigs) {

                            if(option.getKey().equals(
                                    Container.VM_EXTRACONFIG_CONTAINER_KEY)) {
                                pv_is_container.value = true;
                                break;
                            }

                            if(option.getKey().equals(
                                    Vch.VM_EXTRACONFIG_VCH_KEY)) {
                                pv_is_vch.value = true;
                                break;
                            }
                        }
                    }
                }
            }
        }

        resultItem.properties = new PropertyValue[] {pv_is_vch, pv_is_container};

        return resultItem;
    }

    /**
     * Get ServerInfo with the given serverGuid
     * @param serverGuid
     * @return ServerInfo object corresponding to the specified serverGuid
     */
    private ServerInfo getServerInfoObject(String serverGuid) {
        UserSession userSession = _userSessionService.getUserSession();

        for (ServerInfo sinfo : userSession.serversInfo) {
            if (sinfo.serviceGuid.equalsIgnoreCase(serverGuid)) {
                return sinfo;
            }
        }
        return null;
    }

    /**
     * Set thumbprint from the ServerInfo object
     * @param sinfo
     */
    private void setThumbprint(ServerInfo sinfo) {
        String thumbprint = sinfo.thumbprint;
        if (thumbprint != null) {
            _thumbprints.add(thumbprint.replaceAll(":", "").toLowerCase());
        }
        ThumbprintTrustManager.setThumbprints(_thumbprints);
    }

    /**
     * Get ServerContent object with the given serverGuid
     * @param serverGuid
     * @return ServiceContent object corresponding to the specified serverGuid
     */
    private ServiceContent getServiceContent(String serverGuid) {
        ServerInfo serverInfoObject = getServerInfoObject(serverGuid);
        setThumbprint(serverInfoObject);
        String sessionCookie = serverInfoObject.sessionCookie;
        String serviceUrl = serverInfoObject.serviceUrl;

        List<String> values = new ArrayList<String>();
        values.add("vmware_soap_session=" + sessionCookie);
        Map<String, List<String>> reqHeadrs = new HashMap<String, List<String>>();
        reqHeadrs.put("Cookie", values);

        Map<String, Object> reqContext = ((BindingProvider) _vimPort).getRequestContext();
        reqContext.put(BindingProvider.ENDPOINT_ADDRESS_PROPERTY, serviceUrl);
        reqContext.put(BindingProvider.SESSION_MAINTAIN_PROPERTY, true);
        reqContext.put(MessageContext.HTTP_REQUEST_HEADERS, reqHeadrs);

        final ManagedObjectReference svgInstanceRef = new ManagedObjectReference();
        svgInstanceRef.setType(SERVICE_INSTANCE);
        svgInstanceRef.setValue(SERVICE_INSTANCE);

        ServiceContent serviceContent = null;
        try {
            serviceContent = _vimPort.retrieveServiceContent(svgInstanceRef);
        } catch (RuntimeFaultFaultMsg e) {
            _logger.error("getServiceContent error: " + e);
        }

        return serviceContent;
    }

    @Override
    public void sessionEnded(String clientId) {
        _logger.info("Logging out client session - " + clientId);
    }

}
