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

  constructor(
    private router: Router,
  ) {
  
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

}
