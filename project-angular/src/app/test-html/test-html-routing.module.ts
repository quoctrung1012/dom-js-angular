import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {TreeListCdkComponent} from "./tree-list-cdk/tree-list-cdk.component";

const routes: Routes = [
  {path: '', redirectTo: 'tree', pathMatch: 'full'},
  {path: 'view', component: TreeListCdkComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TestHtmlRoutingModule {
}
