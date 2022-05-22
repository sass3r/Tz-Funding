import { Component, OnInit } from '@angular/core';
import { CommunicationService } from '../services/communication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CatalogService } from '../services/catalog.service';

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
  public project: any;
  public projectNft: string;
  public projectPdf: string;
  public fundable: boolean;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private communicationService: CommunicationService,
    private catalogService: CatalogService,
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
  }

  async ngOnInit() {
    this.tokenId = this.activatedRoute.snapshot.params['id'];
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
    this.project = this.projects[this.tokenId];
    console.log(this.project);
    let uriElements = this.project.artifactUri.split("//");
    this.projectNft = "https://gateway.pinata.cloud/ipfs/"+uriElements[1];
    console.log(this.projectNft);
    uriElements = this.project.projectPdf.split("//");
    this.projectPdf = "https://gateway.pinata.cloud/ipfs/"+uriElements[1];
    this.fundable = this.project.collectable;
  }

  async fund() {

  }

}
