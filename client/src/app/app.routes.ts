import { Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { DocViewComponent } from './components/doc-view/doc-view.component';
import { DocListComponent } from './components/doc-list/doc-list.component';
import { DocumentsComponent } from './components/documents/documents.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const routes: Routes = [
  { path: 'sample-route', component: HeaderComponent },
  { path: 'documents', component: DocumentsComponent},
  {path: 'documents/:id', component: DocViewComponent},
  {path: 'dashboard', component: DashboardComponent},
];
