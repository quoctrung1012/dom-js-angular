import {NgModule} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {TestHtmlRoutingModule} from "./test-html-routing.module";
import {TreeListCdkComponent} from './tree-list-cdk/tree-list-cdk.component';
import {DragDropModule} from "@angular/cdk/drag-drop";
import {CdkTreeModule} from "@angular/cdk/tree";

@NgModule({
  declarations: [
    TreeListCdkComponent,
  ],
  imports: [
    CommonModule,
    TestHtmlRoutingModule,
    DragDropModule,
    CdkTreeModule
  ],
  providers: [
    DatePipe,
  ]
})
export class TestHtmlModule { }
