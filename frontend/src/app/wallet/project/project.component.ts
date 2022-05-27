import { Component, ElementRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { CommunicationService } from '../services/communication.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { MintService } from '../services/mint.service';
import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';
import { OpKind } from '@taquito/taquito';
import * as moment from 'moment';
import { char2Bytes } from "@taquito/utils";

@Component({
  selector: 'app-project',
  templateUrl: './project.component.html',
  styleUrls: ['./project.component.scss']
})
export class ProjectComponent implements OnInit {

  public projectForm: FormGroup;
  public errorMessage: string;
  public loading: boolean;
  private name: string;
  private amount: number;
  private description: string;
  private date: string;
  private userAddress: any;
  private tezos: any;
  private objectives: string;
  private submissionDate: string;
  private wallet: any;
  private contractAddress: any;


  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private el: ElementRef,
    private mintService: MintService,
    private communicationService: CommunicationService,
    private dialog: MatDialog,
    private toastr: ToastrService,
  ) {
    this.contractAddress = "KT1MY9NuNgjVW3ssUUFSgvsgH7LKLvppR6di";
    this.tezos = null;
    this.wallet = null;
    this.userAddress = "";
    this.loading = false;
    this.name = "";
    this.amount = 0;
    this.description = "";
    this.date = "";
    this.objectives = "";
    this.submissionDate = "";
    this.errorMessage = "There are errors in the form";
    this.projectForm = this.formBuilder.group({
      'name': ['',[Validators.required]],
      'amount': ['',[Validators.required]],
      'description': ['',[Validators.required]],
      'objectives': ['',[Validators.required]],
      'submissionDate': ['',[Validators.required]],
      'date': ['',[]],
      'image': ['']
    });
  }

  async ngOnInit() {
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
    this.communicationService.emitChange({topic: "getUserAddress"});
    this.communicationService.emitChange({topic: "getTezosToolkit"});
    this.communicationService.emitChange({topic: "getWallet"});
  }

  async onSubmit(form: any) {
    if(this.projectForm.valid) {
      let inputEl: HTMLInputElement = this.el.nativeElement.querySelector('#image');
      let formData = new FormData();
      let object: any = {};
      this.name = form['name'];
      this.amount = form['amount'] * 1000000;
      this.description = form['description'];
      this.objectives = form['objectives'];
      this.submissionDate = form['submissionDate'];
      this.submissionDate = moment(this.submissionDate).format("YYYY-MM-DD");
      this.date = moment(Date.now()).format("YYYY-MM-DD");
      formData.append('projectName', this.name);
      formData.append('amount', this.amount+'');
      formData.append('description', this.description);
      formData.append('objectives', this.objectives);
      formData.append('submissionDate', this.submissionDate);
      formData.append('date', this.date);
      formData.append('file', inputEl.files!.item(0)!);
      formData.append('creator', this.userAddress);
      formData.forEach((value,key) => {
        object[key] = value;
      });
      let projectUpload = await this.mintService.mintProject(formData);
      this.loading = true;
      projectUpload.subscribe(async (success: any) => {
        if(success.status) {
          let response = JSON.parse(success.resources);
          let lenResources = response.length;
          let resource;
          let amount;
          let cid;
          let hash;
          if(lenResources == 1){
            resource = response.pop();
            cid = "ipfs://"+resource.fileMetadata;
            hash = await this.mint(this.amount,cid);
            this.toastr.info("Success view in block explorer: https://ithacanet.tzkt.io/" + hash);
            this.loading = false;
            lenResources = response.length;
            this.router.navigateByUrl("catalog");
          }else{
            await this.mintBatch(response);
          }
        }
      })
    }else{
      this.toastr.error("Please fill the form");
    }
  }

  async mint(amount: number, metadata: string): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        this.tezos.setWalletProvider(this.wallet);
        const contract = await this.tezos.wallet.at(this.contractAddress);
        let bytes = "";
        for(let i = 0; i < metadata.length; i++) {
          bytes += metadata.charCodeAt(i).toString(16).slice(-4);
        }
        const op = await contract.methods['mint'](amount, bytes).send();
        await op.confirmation();
        resolve(op.opHash);
      }catch(error) {
        console.log(error)
      }
    });
  }

  async mintBatch(resources: any): Promise<any> {
    let lenResources = resources.length;
    let resource;
    let amount;
    let cid;
    let hash;
    let batchList: any = [];
    let obj;
    return new Promise(async (resolve, reject) => {
      try{
        this.tezos.setWalletProvider(this.wallet);
        const contract = await this.tezos.wallet.at(this.contractAddress);
        const estimateOp = await contract.methods.mint(this.amount,char2Bytes("ipfs://QmVxo8oztLzkxCCQQVRpWaq1YvZxb5RbWUgYPdpwpff74E")).toTransferParams({});
        const {gasLimit, storageLimit, suggestedFeeMutez } = await this.tezos.estimate.transfer(estimateOp);
        while(lenResources > 0 ){
          resource = resources.pop();
          cid = "ipfs://"+resource.file;
          let bytes = "";
          for(let i = 0; i < cid.length; i++) {
            bytes += cid.charCodeAt(i).toString(16).slice(-4);
          }
          obj = {
            kind: OpKind.TRANSACTION,
            ...contract.methods.mint(this.amount, bytes).toTransferParams({
              fee: suggestedFeeMutez,
              gasLimit: gasLimit,
              storageLimit: storageLimit,
            })
          }
          batchList.push(obj);
          lenResources = resources.length;
        }
        let batch = await this.tezos.wallet.batch(batchList);
        const batchOp = await batch.send();
        const confirmation = await batchOp.confirmation();
        this.toastr.info("Success view in block explorer: https://ithacanet.tzkt.io/");
        this.loading = false;
        this.router.navigateByUrl("catalog");
      }catch(error){
        console.log(error);
      }
    });
  }

  getAmountForm(): FormArray{
    return this.projectForm.get('amount') as FormArray;
  }

  getNameForm(): FormArray{
    return this.projectForm.get('name') as FormArray;
  }

  getDescriptionForm(): FormArray{
    return this.projectForm.get('description') as FormArray;
  }

  getObjectivesForm(): FormArray{
    return this.projectForm.get('objectives') as FormArray;
  }

  getSubmissionDateForm(): FormArray{
    return this.projectForm.get('submissionDate') as FormArray;
  }

  onFileChange(fileChangeEvent: any) {
    if (fileChangeEvent.target.files.length > 0) {
      const image = fileChangeEvent.target.files[0];
      this.projectForm.get('image')!.setValue(image);
    }
  }
}
