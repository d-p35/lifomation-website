// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
export const environment = {
  production: false,
  apiEndpoint: 'http://localhost:3000',
  auth: {
    domain: 'dev-8i2xj8leal3jbezx.us.auth0.com',
    clientId: 's23vi5vr6dmW7wLHWi9eUl0PcB2CXwbH',
    authorizationParams: {
      redirect_uri: window.location.origin,
      audience: 'https://lifomation.tech',
    },
    errorPath: '/error',
  },
  dev: {
    serverUrl: 'http://localhost:3000',
  },

};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
