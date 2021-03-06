import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import * as Sentry from '@sentry/angular';
import { Integrations } from '@sentry/tracing';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import packInfo from '../package.json';

if (environment.production) {
  enableProdMode();
  Sentry.init({
    dsn: 'https://359ab042b2154a95bfcb20aa58d1c76e@o541164.ingest.sentry.io/5659633',
    environment: environment.production ? 'production' : 'development',
    release: `tumi-app@${packInfo.version}`,
    integrations: [
      new Integrations.BrowserTracing({
        tracingOrigins: [
          'localhost',
          'https://tumi.esn.world',
          'https://esn-tumi.de',
        ],
        routingInstrumentation: Sentry.routingInstrumentation,
      }),
    ],

    // We recommend adjusting this value in production, or using tracesSampler
    // for finer control
    tracesSampleRate: 0.1,
  });
}

document.addEventListener('DOMContentLoaded', () => {
  platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .catch((err) => console.error(err));
});
