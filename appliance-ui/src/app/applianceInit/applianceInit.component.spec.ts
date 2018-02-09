import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplianceInitComponent } from './applianceInit.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClarityModule } from '@clr/angular';
import { AuthService } from '../services/auth.service';
import { ApplianceService } from '../services/appliance.service';
import { AppRoutingModule } from '../app-routing.module';
import { LocalStorageService } from '../services/localstorage.service';
import { APP_BASE_HREF } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { appConfigToken } from '../config/app.config';

describe('ApplianceInitComponent', () => {
  let component: ApplianceInitComponent;
  let fixture: ComponentFixture<ApplianceInitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApplianceInitComponent ],
      imports: [
        FormsModule,
        ReactiveFormsModule,
        ClarityModule,
        AppRoutingModule,
        HttpClientModule
      ],
      providers: [
        AuthService,
        ApplianceService,
        LocalStorageService,
        {
          provide: APP_BASE_HREF,
          useValue: '/'
        },
        {
          provide: appConfigToken,
          useValue: {
            baseApiUrl: 'api'
          }
        }
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplianceInitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
