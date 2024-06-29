import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { NgModule } from '@angular/core';
import { HeaderComponent } from './layout/header/header.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const routes: Routes = [
    // Add your routes here
    { path: '', component: AppComponent },
    { path: 'dashboard', component: DashboardComponent },
    

];
@NgModule({
    imports: [RouterModule.forRoot(routes)], // Importing the RouterModule and configuring it with the provided routes
    exports: [RouterModule] // Exporting the RouterModule to make it available for other modules to use
})
export class AppRoutingModule { } // Defining a module class named AppRoutingModule