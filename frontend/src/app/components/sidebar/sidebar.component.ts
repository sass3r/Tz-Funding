import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
declare const $: any;
declare interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
}
export const ROUTES: RouteInfo[] = [];

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  showMenu = true;
  connected: boolean;
  balance: any;

  constructor(
    private router: Router,
  ) {
      this.balance = null;
      this.connected = false; 
  }

  ngOnInit() {
  }

  isMobileMenu() {
      if ($(window).width() > 991) {
          return false;
      }
      return true;
  };

  showOptions() {
    this.router.navigateByUrl('display-options');
  }

  onBalance(balance: any) {
      if(balance != null){
          this.balance = balance/1000000;
          this.connected = true;
      } else {
          this.connected = false;
      }
  }

}
