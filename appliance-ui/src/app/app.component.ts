import { Component, OnInit } from '@angular/core';
import { ApplianceService } from './services/appliance.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/catch';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  public applianceInitialized: boolean;
  public applianceReady: boolean;
  public alert: { type: string; category: string; };

  constructor(
    private applianceService: ApplianceService,
    private router: Router
  ) {

  }

  ngOnInit() {
    this.applianceService
        .waitForApplianceReady(1)
        .catch(err => {
          this.applianceReady = false;
          this.router.navigate(['']);
          return Observable.throw(err);
        })
        .do((ready) => {
          if (!ready) {
            this.router.navigate(['']);
          }
          this.applianceReady = ready;
        })
        .switchMap(() => {
          return this.applianceService
              .isApplianceInitialized();
        })
        .subscribe(init => {
          if (!init) {
            this.router.navigate(['']);
          }
          this.applianceInitialized = init;
        });
  }
}
