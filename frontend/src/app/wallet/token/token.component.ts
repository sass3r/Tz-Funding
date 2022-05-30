import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import {FundComponent} from '../fund/fund.component';

@Component({
  selector: 'app-token',
  templateUrl: './token.component.html',
  styleUrls: ['./token.component.scss']
})
export class TokenComponent implements OnInit {
  @Input() amount: number = 0;
  @Input() logo: string = "";
  @Input() name: string = "";
  @Input() symbol: string = "";
  @Input() description: string = "";
  @Input() fundable: boolean = false;
  @Input() tokenId: number = 0;
  @Input() author: string = "";


  constructor(
    private router: Router,
    private dialog: MatDialog
  ) { 

  }

  ngOnInit(): void {
    let elements = this.logo.split("//");
    this.logo = "https://ipfs.cryptostore.com.bo/ipfs/"+elements[1];
    this.amount = this.amount / 1000000; 
  }

  fund(token_id: number) {
    if(this.fundable) {
      const dialogRef = this.dialog.open(FundComponent, {
        width: '300px',
        height: '220px',
        data: {
          id: token_id,
          author: this.author
        }
      });
    }
  }

  show(id: number) {
    this.router.navigate(['/show', id]); 
  }

}
