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

import { LocalStorageService } from './localstorage.service';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import 'rxjs/add/observable/of';

const LOCALSTORAGE_TOKEN_KEY = 'token';

@Injectable()
export class AuthService {
  private token: string;

  constructor(
    private localStorage: LocalStorageService,
    private router: Router
  ) {}

  login(vcenter: string, username: string, password: string): Observable<boolean> {
    // TODO: plug in swagger generated class for talking to auth endpoint

    this.token = `${username}:${password}`;
    this.localStorage.set(LOCALSTORAGE_TOKEN_KEY, this.token);
    return Observable.of(true);
  }

  /**
   * Returns if the token is valid and has not expired
   * TODO: to be worked
   */
  isLoggedIn(): boolean {
    const token = this.localStorage.get(LOCALSTORAGE_TOKEN_KEY);
    if (!token) {
      return false;
    }
    // TODO: implement JWT token validation
    return true;
  }
}
