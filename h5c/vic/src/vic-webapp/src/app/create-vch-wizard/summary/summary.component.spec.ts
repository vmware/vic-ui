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
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ClarityModule } from 'clarity-angular';
import { HttpModule } from '@angular/http';
import { SummaryComponent } from './summary.component';
import { TestScheduler } from 'rxjs/Rx';
import { Observable } from 'rxjs/Observable';

describe('SummaryComponent', () => {

  let scheduler: TestScheduler;
  let component: SummaryComponent;
  let fixture: ComponentFixture<SummaryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        HttpModule,
        ClarityModule
      ],
      declarations: [
        SummaryComponent
      ]
    });
  });

  beforeEach(() => {
    // Set up TestScheduler to be used with Jasmine assertion
    scheduler = new TestScheduler((a, b) => expect(a).toEqual(b));
    const originalTimer = Observable.timer;

    // Monkey-patch Observable.timer to handle its async behavior using the TestScheduler
    spyOn(Observable, 'timer').and.callFake(
      (initialDelay, dueTime) => originalTimer.call(this, initialDelay, dueTime, scheduler)
    );

    fixture = TestBed.createComponent(SummaryComponent);
    component = fixture.componentInstance;
    component.payload = {
      storageCapacity: {
        imageStore: 'datastore',
        volumeStores: []
      },
      networks: {
        containerNetworks: []
      }
    };
    // component.form.get('targetOS').setValue('windows');
    component.onPageLoad();
  });

  it('should copy cli command to clipboard', () => {
    component.form.get('targetOS').setValue('darwin');
    component.copyCliCommandToClipboard();

    // copySucceeded is set to false or true here to show an error or success message respectively
    expect(component.copySucceeded).not.toBe(null);

    // Schedule a time lapse
    scheduler.schedule(() => {
      // We expect it to return to null here to remove any error/success message
      expect(component.copySucceeded).toBe(null);
    }, 1500, null);

    // Advance in time to run the expect test inside the scheduler
    scheduler.flush();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should start with a valid form', () => {
    // expect(component.form.valid).toBe(true);
  });
});
