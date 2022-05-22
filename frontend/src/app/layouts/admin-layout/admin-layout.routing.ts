import { Routes } from '@angular/router';
import { ConnectComponent } from '../../wallet/connect/connect.component';
import { ShowMenuComponent } from '../../wallet/show-menu/show-menu.component';
import { ProjectComponent } from '../../wallet/project/project.component';
import { CatalogComponent } from '../../wallet/catalog/catalog.component';
import { ShowProjectComponent } from '../../wallet/show-project/show-project.component';

export const AdminLayoutRoutes: Routes = [
    { path: '', redirectTo: '/catalog', pathMatch: 'full' },
    { path: 'catalog', component: CatalogComponent },
    { path: 'connect', component: ConnectComponent },
    { path: 'display-options', component: ShowMenuComponent },
    { path: 'project', component: ProjectComponent },
    { path: 'show/:id', component: ShowProjectComponent },
];
