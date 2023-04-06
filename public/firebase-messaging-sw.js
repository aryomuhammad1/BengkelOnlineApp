/// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here. Other Firebase libraries
// are not available in the service worker.
// importScripts("unpkg.com/dexie@3.2.2/dist/dexie.js");
// import Dexie from "dexie";
importScripts(
  "https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js"
);

// const addResourcesToCache = async (resources) => {
//   const cache = await caches.open("v1");
//   await cache.addAll(resources);
// };

const CACHE_NAME = "V165";
const STATIC_CACHE_URLS = [
  "/",
  "/index.html",
  "/src/css/style.css",
  "/bundle.js",
  //   "/src/js/index.js",
  //   "/src/js/auth.js",
  //   "/src/js/firebase-config.js",
  //   "/src/js/main.js",
  //   "/src/js/main-bengkel.js",
  //   "/src/js/main-montir.js",
  //   "/src/js/mapbox-config.js",
  "src/images/mapbox-icon.png",
  "/src/images/support.png",
  "/src/images/customer-service.png",
  //   "https://api.mapbox.com/mapbox-gl-js/v2.8.2/mapbox-gl.js",
  //   "https://api.mapbox.com/mapbox-gl-js/v2.8.2/mapbox-gl.css",
  //   "https://cdn.jsdelivr.net/npm/@turf/turf@5/turf.min.js",
  // "https://fonts.googleapis.com",
  "https://fonts.googleapis.com/css2?family=Albert+Sans:wght@300;400;600;700&display=swap",
];

self.addEventListener("install", (event) => {
  console.log("Service Worker installing.");
  console.log("[Service Workers] Precaching. . .");
  //   self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_CACHE_URLS))
  );
});

self.addEventListener("activate", (event) => {
  console.log("[ServiceWorker activated!]");

  // delete any unexpected caches
  event.waitUntil(
    clients.claim(),
    caches
      .keys()
      .then((keys) =>
        keys.filter((key) => key !== CACHE_NAME && key !== "mapbox-tiles")
      )
      .then((keys) => {
        Promise.all(
          keys.map((key) => {
            console.log(`Deleting cache ${key}`);
            return caches.delete(key);
          })
        );
      })
  );

  //   Firebase Init
  firebase.initializeApp({
    apiKey: "AIzaSyA51anpLkYPlxlhJj7HR-vG1JVOkAJZSHA",
    authDomain: "aplikasi-bengkel-online.firebaseapp.com",
    projectId: "aplikasi-bengkel-online",
    storageBucket: "aplikasi-bengkel-online.appspot.com",
    messagingSenderId: "721522428619",
    appId: "1:721522428619:web:5360c606488d277182694e",
    measurementId: "G-01H5MHX8H2",
  });

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage((payload) => {
    // alert("[firebase-messaging-sw.js] Received background message ", payload);
    console.log(
      "[firebase-messaging-sw.js] Received background message ",
      payload
    );
    // Customize notification here
    // const notificationTitle = "Ada Panggilan!";
    // const notificationOptions = {
    //   body: `Lokasi pelanggan berjarak ${payload.data.travelTime} dari bengkel Anda`,
    //   icon: "/src/images/gear-icon-192x192.png",
    // };
    let notificationTitle;
    let notificationOptions;
    if (payload.data.topic === "sendOrder") {
      // Customize notification here
      console.log("payload.data.topic == sendOrder");
      notificationTitle = "Ada Panggilan!";
      notificationOptions = {
        body: `Lokasi pelanggan berjarak ${payload.data.travelTime} dari bengkel Anda`,
        icon: "/src/images/gear-icon-192x192.png",
      };
    }
    if (payload.data.topic === "requestCost") {
      // Customize notification here
      console.log("payload.data.topic == sendOrder");
      notificationTitle = `${payload.montirName} mengirim permintaan perhitungan biaya`;
      notificationOptions = {
        body: `Segera hitung biaya perbaikan motor berdasarkan deskripsi dari ${payload.montirName}`,
        icon: "/src/images/gear-icon-192x192.png",
      };
    }

    return self.registration.showNotification(
      notificationTitle,
      notificationOptions
    );
  });

  //   messaging.setBackgroundMessageHandler((payload) => {
  //     console.log(
  //       "[firebase-messaging-sw.js] Received background message ",
  //       payload
  //     );
  //   });
});

async function caching(request, response) {
  console.log("[caching function]");
  if (response.type === "error" || response.type === "opaque") {
    return Promise.resolve(); // do not put in cache network errors
  }

  //   const cache = await caches.open(CACHE_NAME);
  //   const result = await cache.put(request, response.clone());
  //   return result;
  return caches
    .open(CACHE_NAME)
    .then((cache) => cache.put(request, response.clone()));
}

// async function update(request) {
//   return fetch(request.url).then(
//     (response) =>
//       caching(request, response) // we can put response in cache
//         .then(() => response) // resolve promise with the Response object
//   );
// }

self.addEventListener("fetch", (event) => {
  //   console.log("[ServiceWorker fetched!]", event.request);

  //   if (
  //     event.request.method !== "POST" &&
  //     !event.request.url.includes("/api") &&
  //     !event.request.url.includes(".googleapis")
  //   ) {
  // console.log("event.request.method !== POST");
  // response to static files requests, Cache-First strategy
  event.respondWith(
    caches
      .match(event.request) // check if the request has already been cached
      .then((cached) => cached || fetch(event.request)) // otherwise request network
    // .then((response) => {
    //   //   return response;
    //   console.log("caching. . .", response);
    //   caching(event.request, response) // put response in cache
    //     .then(() => {
    //       // console.log("final response ", response);
    //       return response;
    //     }); // resolve promise with the network response
    // })
  );
  //   }
});

self.addEventListener(
  "pushsubscriptionchange",
  (event) => {
    console.log("pushsubscriptionchange event : ", event);
    const subscription = swRegistration.pushManager
      .subscribe(event.oldSubscription.options)
      .then((subscription) =>
        fetch("register", {
          method: "post",
          headers: {
            "Content-type": "application/json",
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
          }),
        })
      );
    event.waitUntil(subscription);
  },
  false
);

self.addEventListener("notificationclick", (event) => {
  console.log("On notification click: ", event.notification.tag);
  event.notification.close();

  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil(
    clients
      .matchAll({
        type: "window",
      })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === "/" && "focus" in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow("/");
      })
  );
});
