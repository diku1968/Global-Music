/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-7e5eb42b'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "1d4a81e1a4f0944d202c3436b74a21ae"
  }, {
    "url": "pwa-512x512.png",
    "revision": "69289fa6b4e504b2e5eda25a623ea438"
  }, {
    "url": "pwa-192x192.png",
    "revision": "aca057eb55b8466bd57c50abb47f8e07"
  }, {
    "url": "index.html",
    "revision": "b150151e94160ab1fca0d42348e4485d"
  }, {
    "url": "icon.svg",
    "revision": "8823cd2e337165574ab1dbbd6cbc2fb9"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "c6425942de3b43ae466665135870be51"
  }, {
    "url": "assets/index-ZJ-Zx7AR.js",
    "revision": null
  }, {
    "url": "assets/index-DEHjC79d.css",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "c6425942de3b43ae466665135870be51"
  }, {
    "url": "icon.svg",
    "revision": "8823cd2e337165574ab1dbbd6cbc2fb9"
  }, {
    "url": "pwa-192x192.png",
    "revision": "aca057eb55b8466bd57c50abb47f8e07"
  }, {
    "url": "pwa-512x512.png",
    "revision": "69289fa6b4e504b2e5eda25a623ea438"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "1d4a81e1a4f0944d202c3436b74a21ae"
  }, {
    "url": "manifest.webmanifest",
    "revision": "e96cca389b40b2961e944a35834d0536"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));

}));
