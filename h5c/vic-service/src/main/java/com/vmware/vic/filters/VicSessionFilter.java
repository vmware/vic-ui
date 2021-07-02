/* Copyright (c) 2021 VMware, Inc. All Rights Reserved. */

package com.vmware.vic.filters;
import static org.springframework.web.context.support.WebApplicationContextUtils.getWebApplicationContext;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.config.AutowireCapableBeanFactory;
import org.springframework.web.context.WebApplicationContext;

import com.vmware.vise.usersession.UserSessionService;

/**
 * Filters requests that have no user session associated with.
 */
@SuppressWarnings("checkstyle:autowiredFilter")
public class VicSessionFilter implements Filter {

    private static final Log LOG = LogFactory.getLog(VicSessionFilter.class);

    /**
     * The session service bean.
     */
    @Autowired
    public UserSessionService sessionService;

    @Override
    public void init(final FilterConfig filterConfig) {
        // Enable auto-wiring of beans
        WebApplicationContext context = getWebApplicationContext(filterConfig.getServletContext());
        if (context == null) {
            System.out.println("org.springframework.web.context. is null");
        }
        AutowireCapableBeanFactory factory = context.getAutowireCapableBeanFactory();
        factory.autowireBean(this);
    }

    @Override
    public void doFilter(final ServletRequest request, final ServletResponse response,
                         final FilterChain filterChain)
            throws IOException, ServletException {
        if (sessionService != null && sessionService.getUserSession() == null) {
            final HttpServletRequest httpRequest = (HttpServletRequest) request;
            final HttpServletResponse httpResponse = (HttpServletResponse) response;
            LOG.warn(String.format("Null session detected for a %s request to %s",
                    httpRequest.getMethod(), httpRequest.getRequestURL()));
            httpResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        filterChain.doFilter(request, response);
    }

    @Override
    public void destroy() {
    }

}