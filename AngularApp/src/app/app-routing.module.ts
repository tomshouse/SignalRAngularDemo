import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AddComponent } from "./components/add/add.component";
import { LoginComponent } from "./components/login/login.component";
import { DriverComponent } from "./components/driver/driver.component";
import { MessagingComponent } from "./components/messaging/messaging.component";

const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'add', component: AddComponent },
    { path: 'login', component: LoginComponent },
    { path: 'driver', component: DriverComponent },
    { path: 'messaging', component: MessagingComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
