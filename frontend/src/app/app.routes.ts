import { Routes } from '@angular/router';
import { adminGuard } from './core/guards/admin';
import { authGuard } from './core/guards/auth';

export const routes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./features/home/home').then(m => m.HomeComponent)
  },
  {
    path: 'book',
    loadComponent: () => import('./features/schedule/schedule').then(m => m.ScheduleComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./features/profile/profile').then(m => m.ProfileComponent)
  },
  {
    path: 'aszf',
    loadComponent: () => import('./features/legal/aszf/aszf').then(m => m.AszfComponent)
  },
  {
    path: 'adatvedelem',
    loadComponent: () => import('./features/legal/privacy/privacy').then(m => m.PrivacyComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./features/contact/contact').then(m => m.ContactComponent)
  },
  {
    path: 'pricing',
    loadComponent: () => import('./features/pricing/pricing').then(m => m.PricingComponent)
  },
  { 
    path: 'admin/classes', 
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin-classes/admin-classes').then(m => m.AdminClassesComponent) 
  },
  { 
    path: 'admin/bookings', 
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin-bookings/admin-bookings').then(m => m.AdminBookingsComponent) 
  },
  { 
    path: 'admin/permissions', 
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin-users/admin-users').then(m => m.AdminUsersComponent) 
  },
  {
    path: 'bookings',
    canActivate: [authGuard],
    loadComponent: () => import('./features/bookings/bookings').then(m => m.BookingsComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];