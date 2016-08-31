import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

// Webpack is going to dynamically build this file
import { SkyPagesModule } from './sky-pages.module';

@NgModule({
    declarations: [ AppComponent ],
    imports: [
      BrowserModule,
      RouterModule,
      SkyPagesModule
    ],
    bootstrap: [ AppComponent ],
})
export class AppModule {}
