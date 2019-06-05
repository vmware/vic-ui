/* Copyright 2016 VMware, Inc. All rights reserved. -- VMware Confidential */
package com.vmware.utils.ssl;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.cert.CertificateException;
import java.util.HashSet;
import java.util.Set;

import javax.net.ssl.SSLException;

public class ThumbprintTrustManager implements javax.net.ssl.TrustManager, javax.net.ssl.X509TrustManager {

    private static final Log _logger = LogFactory.getLog(ThumbprintTrustManager.class);
    private static Set<String> _thumbprints = new HashSet<String>();

    public static void setThumbprints(Set<String> thumbprints) {
        synchronized (ThumbprintTrustManager.class) {
            _thumbprints = thumbprints;
        }
    }

    @Override
    public java.security.cert.X509Certificate[] getAcceptedIssuers() {
        return null;
    }

    @Override
    public void checkServerTrusted(java.security.cert.X509Certificate[] certs, String authType)
            throws CertificateException {
        boolean isContainCert = false;
        for (java.security.cert.X509Certificate cert : certs) {
            String thumbprint = getThumbprint(cert);
            if (checkThumbprint(thumbprint)) {
                isContainCert = true;
                break;
            }
        }

        if (!isContainCert) {
            throw new CertificateException("Server certificate chain is not trusted and thumbprint doesn't match");
        }

    }

    @Override
    public void checkClientTrusted(java.security.cert.X509Certificate[] certs, String authType)
            throws CertificateException {
        return;
    }

    public static String getThumbprint(java.security.cert.X509Certificate cert)
            throws java.security.cert.CertificateException {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-1");
            byte[] certBytes = cert.getEncoded();
            byte[] bytes = md.digest(certBytes);

            StringBuilder builder = new StringBuilder();
            for (byte b : bytes) {
                String hex = Integer.toHexString(0xFF & b);
                if (hex.length() == 1) {
                    builder.append("0");
                }
                builder.append(hex);
            }
            return builder.toString().toLowerCase();
        } catch (NoSuchAlgorithmException ex) {
            return null;
        }
    }

    public static boolean checkThumbprint(String thumbprint) {
        synchronized (ThumbprintTrustManager.class) {
            if (_thumbprints.contains(thumbprint)) {
                _logger.info("expected one of this thumbprints: " + _thumbprints + "\n" + "actual thumbprint: " + "["
                        + thumbprint + "]" + "...thumbprints matching ok!");
                return true;
            }

            _logger.error("Server certificate chain is not trusted " + "and thumbprint doesn't match\n"
                    + "expected one " + "of this " + _thumbprints + "\n" + "actual: " + "[" + thumbprint + "]"
                    + "...matching failed!!");
            return false;

        }
    }
}
