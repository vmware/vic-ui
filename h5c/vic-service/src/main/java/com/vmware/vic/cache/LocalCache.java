/*

Copyright 2019 VMware, Inc. All Rights Reserved.

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
package com.vmware.vic.cache;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class LocalCache {

    private LocalCache() {
    }

    private static LocalCache instance;

    public static LocalCache getInstance() {
        if (instance == null) {
            synchronized (LocalCache.class) {
                if (instance == null) {
                    instance = new LocalCache();
                }
            }
        }
        return instance;
    }

    protected static final Map<String, ValueObject> localCache = new ConcurrentHashMap<String, ValueObject>();

    private static class ValueObject {

        private Object value;
        private long timeout;

        private ValueObject(Object value, long timeout) {
            this.value = value;
            this.timeout = timeout;
        }

        private Object getValue() {
            return value;
        }

        private long getTimeout() {
            return timeout;
        }

    }

    public static void set(String key, Object value) {
        long currentTime = System.currentTimeMillis();
        localCache.put(key, new ValueObject(value, currentTime + 50000));
    }

    public static Object get(String key) {
        long currentTime = System.currentTimeMillis();
        ValueObject valueObject = localCache.get(key);
        if (valueObject == null) {
            return null;
        }
        if (currentTime <= valueObject.getTimeout()) {
            return valueObject.getValue();
        } else {
            localCache.remove(key);
            return null;
        }
    }

}