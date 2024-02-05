import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AboutusComponent } from './ui/aboutus/aboutus.component';
import { LoginComponent } from './ui/auth/login.component';
import { SignupComponent } from './ui/auth/signup.component';
import { AdminComponent } from './ui/auth/admin.component';
import { SettingsComponent } from './ui/auth/settings.component';
import { AddressComponent } from './ui/addressbook/address.component';

// CRM Cloud
import { CampaignComponent } from './ui/market/campaign.component';
import { LeadComponent } from './ui/market/lead.component';
import { OpportunityComponent } from './ui/market/opportunity.component';
import { AppointmentsComponent } from './ui/helpdesk/appointments.component';
import { TicketsComponent } from './ui/helpdesk/tickets.component';
import { WorkordersComponent } from './ui/helpdesk/workorders.component';
import { OrdersComponent } from './ui/orders/orders.component';
import { CallsComponent } from './ui/callregister/calls.component';

// firebase auth guard]
import { AngularFireAuthGuard, hasCustomClaim, redirectUnauthorizedTo, redirectLoggedInTo } from '@angular/fire/auth-guard';
import { canActivate } from '@angular/fire/auth-guard';
import { pipe } from 'rxjs';
import { map } from 'rxjs/operators';
import { HomeComponent } from './ui/home/home.component';
import { LandingComponent } from './ui/landing/landing.component';
import { AddProductComponent } from './ui/addProduct/addproduct.component';
import { AddCategoryComponent } from './ui/addCategory/addcategorycomponent';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const redirectLoggedInToItems = () => redirectLoggedInTo(['aboutus']);
const redirectLoggedInToSettings = () => redirectLoggedInTo(['settings']);
const hasRole = () => map(user => user ? ['settings'] : ['login']);

const routes: Routes = [
  { path: '', redirectTo: '/landing', pathMatch: 'full' },
  { path: 'landing', component: LandingComponent},
  { path: 'addcategory', component: AddCategoryComponent,  ...canActivate(redirectUnauthorizedToLogin) },
  { path: 'addproduct', component: AddProductComponent,  ...canActivate(redirectUnauthorizedToLogin) },
  { path: 'home', component: HomeComponent,  ...canActivate(redirectUnauthorizedToLogin) },
  { path: 'aboutus', component: AboutusComponent,  ...canActivate(redirectUnauthorizedToLogin) },
  { path: 'addressbook', component: AddressComponent,  ...canActivate(redirectUnauthorizedToLogin) },
  { path: 'login', component: LoginComponent, ...canActivate(redirectLoggedInToSettings) },
  { path: 'signup', component: SignupComponent, ...canActivate(redirectLoggedInToSettings) },
  { path: 'settings', component: SettingsComponent, ...canActivate(redirectUnauthorizedToLogin) },
  { path: 'admin', component: AdminComponent, ...canActivate(redirectUnauthorizedToLogin) },
  { path: 'campaign', component: CampaignComponent, ...canActivate(redirectUnauthorizedToLogin) },
  { path: 'lead', component: LeadComponent, ...canActivate(redirectUnauthorizedToLogin) },
  { path: 'opportunity', component: OpportunityComponent, ...canActivate(redirectUnauthorizedToLogin) },
  { path: 'appointment', component: AppointmentsComponent, ...canActivate(redirectUnauthorizedToLogin) },
  { path: 'ticket', component: TicketsComponent, ...canActivate(redirectUnauthorizedToLogin) },
  { path: 'workorder', component: WorkordersComponent, ...canActivate(redirectUnauthorizedToLogin) },
  { path: 'order', component: OrdersComponent, ...canActivate(redirectUnauthorizedToLogin) },
  { path: 'call', component: CallsComponent, ...canActivate(redirectUnauthorizedToLogin) },
  { path: '**', redirectTo: '/landing', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
