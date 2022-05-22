import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { NetworkType } from '@airgap/beacon-sdk';
import { CommunicationService } from '../services/communication.service';

@Component({
  selector: 'app-connect',
  templateUrl: './connect.component.html',
  styleUrls: ['./connect.component.scss']
})
export class ConnectComponent implements OnInit {

  private wallet: any;
  private tezos: TezosToolkit;
  public balance: any;
  public userAddress: any;
  public labelButton: string;
  private connected: boolean;
  @Output() notifyBalance = new EventEmitter<any>();

  constructor( 
    private router: Router,
    private communicationService: CommunicationService
  ) {
    this.wallet = null;
    this.userAddress = null;
    this.balance = null;
    this.tezos = new TezosToolkit("https://ithacanet.cryptostore.com.bo");
    this.labelButton = "Connect Wallet";
    this.connected = false;
  }

  async ngOnInit() {
    this.communicationService.changeEmitted$.subscribe((change: any) => {
      if(change.topic == "getUserAddress") {
        this.communicationService.emitChange({topic: 'setUserAddress', msg: this.userAddress});
      }
      if(change.topic == "getTezosToolkit") {
        this.communicationService.emitChange({topic: 'setTezosToolkit', msg: this.tezos});
      }
      if(change.topic == "getWallet") {
        this.communicationService.emitChange({topic: 'setWallet', msg: this.wallet});
      }
    });
  }

  async createWallet() {
    if(!this.wallet) {
      this.wallet = new BeaconWallet({
        name: "Tz Funding",
        preferredNetwork: NetworkType.ITHACANET,
      });
    }
    this.tezos.setWalletProvider(this.wallet);
    let activeAccount = await this.wallet.client.getActiveAccount();
    if(activeAccount) {
      this.userAddress = await this.wallet.getPKH();
      this.balance = await (await this.tezos.tz.getBalance(this.userAddress)).toNumber();
    }
  }

  async connectWallet() {
    try {
      if(!this.connected) {
        if(!this.wallet)
          await this.createWallet();
        await this.wallet.requestPermissions({
          network: {
            type: NetworkType.ITHACANET,
            rpcUrl: "https://ithacanet.cryptostore.com.bo"
          }
        });
        this.userAddress = await this.wallet.getPKH();
        this.balance = await (await this.tezos.tz.getBalance(this.userAddress)).toNumber();
        this.notifyBalance.emit(this.balance);
        this.labelButton = "Disconnect Wallet";
        this.connected = true;
        console.log(this.userAddress);
        console.log(this.balance);
      } else {
        this.disconnect();
      }
    } catch (error) {
      console.log(error);
    }
  }

  async disconnect() {
    this.userAddress = null;
    this.balance = null;
    this.labelButton = "Connect Wallet";
    this.router.navigateByUrl('connect');
    this.wallet = null;
    this.connected = false;
    this.notifyBalance.emit(this.balance);
    if(this.wallet) {
      await this.wallet.client.removeAllAccounts();
      await this.wallet.client.removeAllPeers();
      await this.wallet.client.destroy();
    }
  }
}
