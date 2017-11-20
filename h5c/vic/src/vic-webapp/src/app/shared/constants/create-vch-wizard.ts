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
import { environment } from '../../../environments/environment';

export const VIC_ROOT_OBJECT_ID_WITH_NAME = 'urn:vic:vic:Root:vic%25252Fvic-root?properties=name';
export const CREATE_VCH_WIZARD_URL =
    `/ui/vic/resources/${environment.production ? 'dist' : 'build-dev'}/index.html?view=create-vch`;
export const WIZARD_MODAL_WIDTH = 1050;
export const WIZARD_MODAL_HEIGHT = 700;
export const CHECK_RP_UNIQUENESS_URL = '/ui/vic/rest/services/check-rp-uniqueness';
export const GET_CLONE_TICKET_URL = '/ui/vic/rest/services/acquire-clone-ticket';
export const CPU_MIN_LIMIT_MHZ = 1;
export const MEMORY_MIN_LIMIT_MB = 1;
export const VIC_APPLIANCE_PORT = 8443;
export const VIC_APPLIANCES_LOOKUP_URL = '/ui/vic/rest/services/get-vic-appliances';

/**
 * Events
 */
export const DATAGRID_REFRESH_EVENT = 'datagridRefresh';
