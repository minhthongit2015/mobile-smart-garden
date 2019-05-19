import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadChildren: './home/home.module#HomePageModule' },
  { path: 'welcome', loadChildren: './welcome/welcome.module#WelcomePageModule' },
  { path: 'login', loadChildren: './login/login.module#LoginPageModule' },
  { path: 'garden', loadChildren: './garden/garden.module#GardenPageModule' },
  { path: 'garden-detail/:id', loadChildren: './garden-detail/garden-detail.module#GardenDetailPageModule' , pathMatch: 'prefix'},
  { path: 'manage-gardens', loadChildren: './manage-gardens/manage-gardens.module#ManageGardensPageModule' },
  { path: '**', redirectTo: 'home', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
