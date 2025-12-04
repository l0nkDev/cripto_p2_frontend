import { Routes } from '@angular/router';
import { Home } from './screens/home/home';
import { Examples } from './screens/examples/examples';

export const routes: Routes = [
  {
    path: '', component: Home
  },
  {
    path: 'examples', component: Examples
  }
];
