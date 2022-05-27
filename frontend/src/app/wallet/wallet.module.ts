import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ConnectComponent } from './connect/connect.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';
import {MatDialogModule} from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import {MatSelectModule} from '@angular/material/select';
import { ShowMenuComponent } from './show-menu/show-menu.component';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { ProjectComponent } from './project/project.component';
import { ToastrModule } from 'ngx-toastr';
import { CatalogComponent } from './catalog/catalog.component';
import { TokenComponent } from './token/token.component';
import { ShowProjectComponent } from './show-project/show-project.component';
import { FundComponent } from './fund/fund.component';

@NgModule({
  declarations: [
    ConnectComponent,
    ShowMenuComponent,
    ProjectComponent,
    CatalogComponent,
    TokenComponent,
    ShowProjectComponent,
    FundComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ClipboardModule,
    MatDialogModule,
    MatSelectModule,
    MatDatepickerModule 
  ],
  exports: [
    ConnectComponent
  ]
})
export class WalletModule { }