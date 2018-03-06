import { TestBed, inject, async } from '@angular/core/testing';
import { MockBackend, MockConnection } from '@angular/http/testing';
import { Http, XHRBackend, BrowserXhr, RequestOptions, BaseRequestOptions,
  ResponseOptions, BaseResponseOptions, ConnectionBackend } from '@angular/http';
import { Globals, GlobalsService } from '../shared/index';
import { HttpInterceptorService } from './http-interceptor.service';

describe('HTTP interceptor Service', () => {

  let service: HttpInterceptorService;

  beforeEach(async(() => { TestBed.configureTestingModule({
         providers: [
          { provide: XHRBackend, useClass: MockBackend },
          { provide: RequestOptions, useClass: BaseRequestOptions },
          { provide: ResponseOptions, useClass: BaseResponseOptions },
          HttpInterceptorService,
          Globals,
          GlobalsService,
          BrowserXhr]
   }).compileComponents();
          service = TestBed.get(HttpInterceptorService);
  }));

  describe('HTTP interceptor', () => {
    it('should intercept http request', async(inject([XHRBackend], (mockBackend) => {
      mockBackend.connections.subscribe(connection => {
        connection.mockRespond(new ResponseOptions({status: 401}));
      });
      service.request('/ui/usersession')
          .subscribe(response => {
            expect(response.status).toBe(401);
          }, (error: Error) => {
              console.error(error);
          });
      })));
    });
});
