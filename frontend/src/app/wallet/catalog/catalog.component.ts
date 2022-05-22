import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommunicationService } from '../services/communication.service';
import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { CatalogService } from '../services/catalog.service';
import {TokenComponent } from '../token/token.component';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit {
  private wallet: any;
  private tezos: any;
  private userAddress: any;
  public projects: any;

  constructor(
    private communicationService: CommunicationService,
    private catalogService: CatalogService
  ) {
    this.tezos = null;
    this.wallet = null;
    this.userAddress = "";
    this.projects = null;
  }

  async ngOnInit() {
    this.communicationService.changeEmitted$.subscribe((change: any) => {
      if(change.topic == "setUserAddress") {
        if(change.msg != null){
          this.userAddress = change.msg;
          console.log(change);
        }
      }
      if(change.topic == "setTezosToolkit") {
        if(change.msg != null){
          this.tezos = change.msg;
          console.log(change);
        }
      }
      if(change.topic == "setWallet") {
        if(change.msg != null){
          this.wallet = change.msg;
          console.log(change);
        }
      }
    });
    this.projects = await this.catalogService.fetchProjects()
      .then((projects: any) => {
        return projects
      })
    console.log(this.projects);
  }

}
