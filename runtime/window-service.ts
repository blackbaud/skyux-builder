/*
This WindowService exists entirely to allow AOT compilation on the Window interface.
If the follow error is resolved, it could safely be removed, although this is probably cleaner.

http://stackoverflow.com/questions/34177221/angular2-how-to-inject-window-into-an-angular2-service
https://github.com/angular/angular/issues/15640
*/

import { Injectable } from '@angular/core';

function getWindow() {
  return window;
}

@Injectable()
export class WindowService {
  get window(): any {
    return getWindow();
  }
}
