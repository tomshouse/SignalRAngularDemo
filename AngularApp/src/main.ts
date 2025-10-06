import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));

// Point to Source mapping file to enable TypeScrcipt Debugging in Chrome DevTools when remote debugging
//# sourceURL=File:///D:/Development/SignalRAngularDemo/AngularApp/dist/main-es2015.js.map
//# TomRoberts-sourceURL=File:///D:/Development/FixedRoute/PT-Mobile/PT/PTMobile/PTAngularApp/dist/main-es2015.js.map
