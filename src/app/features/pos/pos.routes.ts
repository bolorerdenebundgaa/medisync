import { Routes } from '@angular/router';

export const posRoutes: Routes = [
  { 
    path: '', 
    loadComponent: () => import('./components/pos.component').then(m => m.PosComponent)
  }
];