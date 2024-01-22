import { Routes } from '@angular/router';
import {HomeComponent} from "./home/home.component";

export const routes: Routes = [
  {path: '', redirectTo: 'home', pathMatch: 'full'},
  {path: 'home', component: HomeComponent},
  {
    path: 'test',
    loadChildren: () => import('./test-html/test-html.module').then(m => m.TestHtmlModule)
  },
];
