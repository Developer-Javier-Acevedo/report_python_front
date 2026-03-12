import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'map',
    pathMatch: 'full'
  },
  {
    path: 'map',
    loadChildren: () =>
      import('./features/geospatial/geospatial.routes').then(
        (m) => m.GEOSPATIAL_ROUTES
      )
  },
  {
    path: '**',
    redirectTo: 'map'
  }
];
