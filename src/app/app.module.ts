import { APP_BASE_HREF } from '@angular/common';
import { NgModule } from '@angular/core';
import {ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { DrawRectangleDirective } from './d/draw-rectangle.directive';

export function getBaseLocation() {
  let paths: string[] = location.pathname.split('/').splice(1, 1);
  let basePath: string = (paths && paths[0]) || 'my-account'; // Default: my-account
  return '/' + basePath;
}

@NgModule({
  declarations: [
    AppComponent,
    DrawRectangleDirective
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule
  ],
  providers: [
    {
      provide: APP_BASE_HREF,
      useValue: getBaseLocation()
  }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
