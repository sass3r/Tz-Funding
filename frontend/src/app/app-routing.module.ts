import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConnectComponent } from './connect/connect.component';
import { ShowMenuComponent } from './show-menu/show-menu.component';
import { MatDatepickerModule } from '@angular/material/datepicker';


const routes: Routes = [
  { path: 'connect', component: ConnectComponent },
  { path: 'display-options', component: ShowMenuComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes), MatDatepickerModule],
  exports: [RouterModule]
})
export class AppRoutingModule { }
