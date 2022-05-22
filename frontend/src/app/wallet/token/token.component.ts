import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

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


  constructor(private router: Router) { 

  }

  ngOnInit(): void {
    let elements = this.logo.split("//");
    this.logo = "https://gateway.pinata.cloud/ipfs/"+elements[1];
    this.amount = this.amount / 1000000; 
  }

  fund() { 

  }

  show(id: number) {
    this.router.navigate(['/show', id]); 
  }

}
