/*
 Copyright 2018 VMware, Inc. All Rights Reserved.

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

import {UiActionsComponent} from './ui-actions.component';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {GlobalsService} from '../shared';
import {ActivatedRoute} from '@angular/router';
import {Observable, of} from 'rxjs';

describe('UiActionsComponent', () => {
  let component: UiActionsComponent;
  let fixture: ComponentFixture<UiActionsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        UiActionsComponent
      ],
      providers: [
        {
          provide: GlobalsService,
          useValue: {
            getWebPlatform() {
              return {
                closeDialog: () => {},
                sendNavigationRequest: () => {}
              };
            }
          }
        },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({})
          }
        }
      ],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UiActionsComponent);
    component = fixture.componentInstance;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should be empty', () => {
    expect(fixture.nativeElement.textContent.trim()).toBe('');
  });
});
