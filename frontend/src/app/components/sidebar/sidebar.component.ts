import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CommunicationService } from '../../wallet/services/communication.service';
import AppStorage from "@randlabs/encrypted-local-storage";
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
  private obfuscateKey: string;
  addressBook: Array<any>;
  showMenu = true;
  menuItems: any[] = [];

  constructor(
    private router: Router,
    private communicationService: CommunicationService,
  ) {
    this.obfuscateKey = "";
    this.addressBook = [];
   }

  ngOnInit() {
    this.menuItems = ROUTES.filter(menuItem => menuItem);
    this.communicationService.changeEmitted$.subscribe((change: any) => {
      if(change.topic == "setObfuscateKey") {
        this.obfuscateKey = change.msg;
        this.decodeAddressBook();
      }
    });
    this.communicationService.emitChange({topic: 'getObfuscateKey'});
  }
  isMobileMenu() {
      if ($(window).width() > 991) {
          return false;
      }
      return true;
  };
  verify(routePath: string): boolean {
    let res: boolean = true;
    return res;
  }
  showOptions() {
    this.router.navigateByUrl('display-options');
  }

  async decodeAddressBook() {
    let appStorage = new AppStorage(this.obfuscateKey);
    let data = await appStorage.loadItemFromStorage("address_book")
    .then((data) => {
      console.log(data);
      this.addressBook = data;
    })
    .catch(e => {
      console.log(e);
    });
  }

  navigate(index: string) {
    console.log(index);
    this.router.navigate(['/balance',index]);
  }
}
