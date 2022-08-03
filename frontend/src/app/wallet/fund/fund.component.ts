import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { CommunicationService } from '../services/communication.service';
import { TezosToolkit } from '@taquito/taquito';
import { BeaconWallet } from '@taquito/beacon-wallet';

@Component({
  selector: 'app-fund',
  templateUrl: './fund.component.html',
  styleUrls: ['./fund.component.scss']
})
export class FundComponent implements OnInit {
  private userAddress: any;
  private tezos: any;
  private wallet: any;
  private contractAddress: any;
  public errorMessage: string;
  public fundForm: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private dialogRef: MatDialogRef<FundComponent>,
    private toastr: ToastrService,    
    private communicationService: CommunicationService,
    @Inject(MAT_DIALOG_DATA) public data: FundModalPayload
  ) { 
      this.contractAddress = "KT1HLBVzNXthbyjpWNazZBdEGZuHJbPjN68E";
      this.tezos = null;
      this.wallet = null;
      this.userAddress = ""; 
      this.fundForm = this.formBuilder.group({
        'amount': ["",[Validators.required]],
      });
      this.errorMessage="Enter an amount";
  }

  ngOnInit(): void {
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
    const amount = form['amount'];
    if(this.fundForm.valid) {
      try {
        this.tezos.setWalletProvider(this.wallet);
        const transfer = this.tezos.wallet.transfer({
          to: this.data.author,
          amount: amount,
        });
        const op = await transfer.send();
        this.toastr.info("Transaction success");
        this.dialogRef.close(true);
      }catch(error: any) {
        if(!this.wallet)
          this.toastr.info('Please connect your wallet', '');
      }
    }
  }

  getAmountForm(): FormArray{
    return this.fundForm.get('amount') as FormArray;
  }
}

export interface FundModalPayload {
    id: number;
    author: string;
}
