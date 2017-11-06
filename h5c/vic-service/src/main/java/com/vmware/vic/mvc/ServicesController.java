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

Mac OS script starting an Ant build of the current flex project
Note: if Ant runs out of memory try defining ANT_OPTS=-Xmx512M

 */

package com.vmware.vic.mvc;

import java.io.PrintWriter;
import java.io.StringWriter;
import java.util.HashMap;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import com.vmware.vic.services.EchoService;
import com.vmware.vic.services.ResourcePoolService;
import com.vmware.vic.services.VicUserSessionService;


/**
 * A controller to serve HTTP JSON GET/POST requests to the endpoint "/services".
 * Its purpose is simply to redirect HTTP requests to the service APIs implemented in
 * separate components.
 */
@Controller
@RequestMapping(value = "/services")
public class ServicesController {
    private final EchoService _echoService;
    private final ResourcePoolService _resourcePoolService;
    private final VicUserSessionService _vicUserSessionService;

    @Autowired
    public ServicesController(
            @Qualifier("echoService") EchoService echoService,
            @Qualifier("rpService") ResourcePoolService resourcePoolService,
            @Qualifier("vicUserSessionService") VicUserSessionService vicUserSessionService) {
        _echoService = echoService;
        _resourcePoolService = resourcePoolService;
        _vicUserSessionService = vicUserSessionService;
    }

    // Empty controller to avoid compiler warnings in vic's bundle-context.xml
    // where the bean is declared
    public ServicesController() {
        _echoService = null;
        _resourcePoolService = null;
        _vicUserSessionService = null;
    }


    /**
     * Echo a message back to the client.
     */
    @RequestMapping(value = "/echo", method = RequestMethod.POST)
    @ResponseBody
    public String echo(@RequestParam(value = "message", required = true) String message)
            throws Exception {
        return _echoService.echo(message);
    }

    /**
     * Check if the name for a new ResourcePool already exists
     * @throws Exception
     */
    @RequestMapping(value = "/check-rp-uniqueness", method = RequestMethod.POST)
    @ResponseBody
    public boolean checkRpUniqueness(
            @RequestParam(value = "name", required = true) String name) throws Exception {
        return _resourcePoolService.isNameUnique(name);
    }

    /**
     * Check if the current session user is vSphere admin
     * @return true if admin
     */
    @RequestMapping(value = "/is-user-vsphere-admin", method = RequestMethod.GET)
    @ResponseBody
    public boolean isUserVsphereAdmin() {
        return _vicUserSessionService.isCurrentUserVsphereAdmin();
    }

    /**
     * Generic handling of internal exceptions.
     * Sends a 500 server error response along with a json body with messages
     *
     * @param ex The exception that was thrown.
     * @param response
     * @return a map containing the exception message, the cause, and a stackTrace
     */
    @ExceptionHandler(Exception.class)
    @ResponseBody
    public Map<String, String> handleException(Exception ex, HttpServletResponse response) {
        response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());

        Map<String,String> errorMap = new HashMap<String,String>();
        errorMap.put("message", ex.getMessage());
        if(ex.getCause() != null) {
            errorMap.put("cause", ex.getCause().getMessage());
        }
        StringWriter sw = new StringWriter();
        PrintWriter pw = new PrintWriter(sw);
        ex.printStackTrace(pw);
        errorMap.put("stackTrace", sw.toString());

        return errorMap;
    }
}

