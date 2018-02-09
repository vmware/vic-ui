import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { ApplianceInitComponent } from './applianceInit/applianceInit.component';
import { ApplianceService } from './services/appliance.service';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ClarityModule } from '@clr/angular';
import { HttpClientModule } from '@angular/common/http';
import { appConfigToken } from './config/app.config';

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ClarityModule,
        HttpClientModule
      ],
      schemas: [ NO_ERRORS_SCHEMA ],
      declarations: [
        AppComponent,
        ApplianceInitComponent
      ],
      providers: [
        ApplianceService,
        { provide: appConfigToken, useValue: { baseApiUrl: 'api' }}
      ]
    }).compileComponents();
  }));
  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
});
