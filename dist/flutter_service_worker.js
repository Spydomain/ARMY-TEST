'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"assets/fonts/MaterialIcons-Regular.otf": "5c77fbb362942c9e93b2c6fd39cd5b00",
"assets/AssetManifest.bin": "88c1b2313477c89910441a4849ba7ef3",
"assets/assets/images/T_54_55.png": "ba7442f37d1dc623a71ab4f554284cd9",
"assets/assets/images/BTR_80_A.png": "b6a1e2cf76554a0cdfbfd5b75c2d5216",
"assets/assets/images/Mi-28.png": "7a5d7495b4477de4dd3990946f9b683b",
"assets/assets/images/MI-24.png": "a44bd00f7d2c78c0c556035c0c370c23",
"assets/assets/images/BMD_1.png": "ddb6519f309e594d24b006fc6d91c530",
"assets/assets/images/T_80.png": "dedde7e77527836b11c55602448db223",
"assets/assets/images/BRDM_2.png": "5bd46944ca767716f5fdffb72c9041b9",
"assets/assets/images/T_90.png": "001766b8a6d87505bfc5872d8b00472d",
"assets/assets/images/PKM.png": "52cefc24ac8dd20fc3e12ed4e960b6f3",
"assets/assets/images/BTR_80.png": "7d01cc40d3d051f52009755d7f912844",
"assets/assets/images/BMD_2.png": "c89cdcd7ddcf02a637b5d584f8798238",
"assets/assets/images/AKM.png": "721a8710646b071b08d3558bc93d416d",
"assets/assets/images/MI-28.png": "7a5d7495b4477de4dd3990946f9b683b",
"assets/assets/images/Mi-26.png": "1a009b2b5967931e3b1c4aac9bf46a64",
"assets/assets/images/BTR_60.png": "216737a0180b2a45ec28fb55e1bd2146",
"assets/assets/images/RPK.png": "24d8e308168aff05f04bbfa1ea00335b",
"assets/assets/images/Mi-52.png": "96bc11b40c012b7746c525a5b0ddba09",
"assets/assets/images/Mi-24.png": "a44bd00f7d2c78c0c556035c0c370c23",
"assets/assets/images/BTR_70.png": "3eada624d82496ed610d8246983c9694",
"assets/assets/images/T_64.png": "d9a32d2888e389b51bbf985576b5fc2a",
"assets/assets/images/BMP_1.png": "9440626b585269dd7d1659786ff6880f",
"assets/assets/images/Ka-52.png": "96bc11b40c012b7746c525a5b0ddba09",
"assets/assets/images/BMP_3.png": "247cce464b241fceae4094e9a54f0243",
"assets/assets/images/AGS_17.png": "49bca942e7cfe2283dabf5ce28c658ce",
"assets/assets/images/BMD_3.png": "dc1124c0a85008e12c8c43cc604af41a",
"assets/assets/images/T_62.png": "046e2c1b3113c4a1c3128bd71c9e6ef8",
"assets/assets/images/BMP_2.png": "d394a8acd867fdb1d16b09d96cf328c9",
"assets/assets/images/T_72.png": "d5d6b98e2e0b44df4c5a8ea1286ce604",
"assets/assets/images/RPG_7.png": "2d276322661458a4cb7906da7536e0e4",
"assets/assets/images/MI-8.png": "77e314a390eada93d1ed4eeed0e73507",
"assets/assets/images/Mi-8.png": "77e314a390eada93d1ed4eeed0e73507",
"assets/assets/images/SVD.png": "ad459d8b95fe4a264383c0549d91c1ee",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/AssetManifest.json": "afed99c8a16c27742d74ca0d8c78d132",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "33b7d9392238c04c131b6ce224e13711",
"assets/NOTICES": "eb7cde71fe3d54b95a2602fef1a0f538",
"assets/AssetManifest.bin.json": "a627143c9d0b60f3f2fae6c91e99ee82",
"assets/shaders/ink_sparkle.frag": "ecc85a2e95f5e9f53123dcaf8cb9b6ce",
"index.html": "7559f177b4c5f0e4adc3a95103b7e79c",
"/": "7559f177b4c5f0e4adc3a95103b7e79c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"version.json": "b173a6c824353a89519c2b4772876026",
"main.dart.js": "f704588cab0c721cc5d27c9db27c43b9",
"manifest.json": "8e66e1314dbabf0aa13062137d7bf013",
"flutter_bootstrap.js": "49ff7eb17adc64c8cb38f112f41f5e7b",
"flutter.js": "888483df48293866f9f41d3d9274a779",
"canvaskit/canvaskit.js.symbols": "58832fbed59e00d2190aa295c4d70360",
"canvaskit/canvaskit.wasm": "07b9f5853202304d3b0749d9306573cc",
"canvaskit/chromium/canvaskit.js.symbols": "193deaca1a1424049326d4a91ad1d88d",
"canvaskit/chromium/canvaskit.wasm": "24c77e750a7fa6d474198905249ff506",
"canvaskit/chromium/canvaskit.js": "5e27aae346eee469027c80af0751d53d",
"canvaskit/skwasm_heavy.wasm": "8034ad26ba2485dab2fd49bdd786837b",
"canvaskit/skwasm.wasm": "264db41426307cfc7fa44b95a7772109",
"canvaskit/skwasm.js.symbols": "0088242d10d7e7d6d2649d1fe1bda7c1",
"canvaskit/canvaskit.js": "140ccb7d34d0a55065fbd422b843add6",
"canvaskit/skwasm_heavy.js": "413f5b2b2d9345f37de148e2544f584f",
"canvaskit/skwasm.js": "1ef3ea3a0fec4569e5d531da25f34095",
"canvaskit/skwasm_heavy.js.symbols": "3c01ec03b5de6d62c34e17014d1decd3",
"favicon.png": "5dcef449791fa27946b3d35ad8803796"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"flutter_bootstrap.js",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
