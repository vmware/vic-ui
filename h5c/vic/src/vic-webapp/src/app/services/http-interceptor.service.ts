import { Injectable } from '@angular/core';
import { Request, XHRBackend, RequestOptions, Response, Http, RequestOptionsArgs, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { GlobalsService } from '../shared/index';
import { VCH_VIEW_ID, VIC_OBJ_ID } from '../shared/constants/resources.path';

@Injectable()
export class HttpInterceptorService extends Http {

  constructor(
    private globalsService: GlobalsService,
    backend: XHRBackend,
    defaultOptions: RequestOptions
  ) {
    super(backend, defaultOptions);
  }

  request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
    return super.request(url, options).catch((error: Response) => {
      if ((error.status === 401 || error.status === 403)) {
        console.error('The authentication session expired or the user is not authorized.');
        // send nav request to H5 to trigger session alert
        this.globalsService
        .getWebPlatform()
        .sendNavigationRequest(
          VCH_VIEW_ID,
          VIC_OBJ_ID
        );
        return Observable.throw(error);
      } else {
        super.request(url, options);
      }
    });
  }
}
