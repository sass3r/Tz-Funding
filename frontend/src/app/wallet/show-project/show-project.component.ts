import { Component, OnInit } from '@angular/core';
import { CommunicationService } from '../services/communication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CatalogService } from '../services/catalog.service';
import { MatDialog } from '@angular/material/dialog';
import {FundComponent} from '../fund/fund.component';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-show-project',
  templateUrl: './show-project.component.html',
  styleUrls: ['./show-project.component.scss']
})
export class ShowProjectComponent implements OnInit {
  private wallet: any;
  private tezos: any;
  private userAddress: any;
  private projects: any;
  private tokenId: number;
  private contractAddress: string;
  public project: any;
  public projectNft: string;
  public projectPdf: string;
  public fundable: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private communicationService: CommunicationService,
    private catalogService: CatalogService,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) {
    this.tokenId = 0;
    this.tezos = null;
    this.wallet = null;
    this.userAddress = "";
    this.projects = null;
    this.project = null;
    this.projectNft = "";
    this.projectPdf = "";
    this.fundable = false;
    this.contractAddress = "KT1JbobmwQDhozgyLDuQWnJqN6idYLd4tGL2"
  }

  async ngOnInit() {
    this.tokenId = this.activatedRoute.snapshot.params['id'];
    this.communicationService.changeEmitted$.subscribe((change: any) => {
      if(change.topic == "setUserAddress") {
        if(change.msg != null){
          this.userAddress = change.msg;
        }
      }
      if(change.topic == "setTezosToolkit") {
        if(change.msg != null){
          this.tezos = change.msg;
        }
      }
      if(change.topic == "setWallet") {
        if(change.msg != null){
          this.wallet = change.msg;
        }
      }
    });
    this.projects = await this.catalogService.fetchProjects()
    .then((projects: any) => {
      return projects
    })
    this.project = this.projects[this.tokenId];
    let uriElements = this.project.artifactUri.split("//");
    this.projectNft = "https://ipfs.cryptostore.com.bo/ipfs/"+uriElements[1];
    uriElements = this.project.projectPdf.split("//");
    this.projectPdf = "https://ipfs.cryptostore.com.bo/ipfs/"+uriElements[1];
    this.fundable = this.project.collectable;
  }

  async collectNFT() {
    this.communicationService.emitChange({topic: "getUserAddress"});
    this.communicationService.emitChange({topic: "getTezosToolkit"});
    this.communicationService.emitChange({topic: "getWallet"});
    try {
      this.tezos.setWalletProvider(this.wallet);
      const contract = await this.tezos.wallet.at(this.contractAddress);
      const op = await contract.methods
        .collect(this.tokenId)
        .send({mutez: true, amount:this.project.amount});
      await op.confirmation();
      this.toastr.info("Success view in block explorer: https://ithacanet.tzkt.io/" + op.hash);
    } catch (error) {
      if(!this.wallet)
        this.toastr.info("Please connect your wallet");
    }
  }
}
