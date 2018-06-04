import {ConfigureVchService} from './configure-vch.service';
import {GlobalsService} from '../shared/globals.service';
import {VchView, VchViewTypes} from '../interfaces/vch';
import {ActivatedRoute} from '@angular/router';
import {Observable} from 'rxjs/Observable';
import {vchToVchView} from '../shared/utils/vch/vch-utils';
import {OnInit} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

export abstract class ConfigureVchBase implements OnInit {

  public vchId: string;
  public vchInfo: Observable<VchView>;
  public currentModelEmitter: BehaviorSubject<VchViewTypes> = new BehaviorSubject(null);

  constructor(protected globalsService: GlobalsService,
              protected configureVchService: ConfigureVchService,
              protected activatedRoute: ActivatedRoute) {
  }

  ngOnInit() {
    this.vchId = this.activatedRoute.snapshot.url[0].path;
    this.vchInfo = this.configureVchService.getVchInfo(this.vchId)
      .map(vchToVchView);
  }

  modelChange(model: VchViewTypes) {
    this.currentModelEmitter.next(model);
  }

}
