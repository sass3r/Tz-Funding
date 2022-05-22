import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-show-menu',
  templateUrl: './show-menu.component.html',
  styleUrls: ['./show-menu.component.scss']
})
export class ShowMenuComponent implements OnInit {

  constructor(
    private router: Router
  ) {

  }

  ngOnInit(): void {
  }

  publishProject() {
    this.router.navigateByUrl('project');
  }

  investedProjects() {
    this.router.navigateByUrl('invested-projects');
  }
}
