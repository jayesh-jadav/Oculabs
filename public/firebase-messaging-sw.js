importScripts(
  "https://www.gstatic.com/firebasejs/9.22.1/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/9.22.1/firebase-messaging-compat.js"
);

// Firebase configuration
var firebaseConfig = {
  apiKey: "AIzaSyBvpNUayaX1iNh5ufs8dS3Uwd_m5LyEneE",
  authDomain: "oculo-web.firebaseapp.com",
  projectId: "oculo-web",
  storageBucket: "oculo-web.appspot.com",
  messagingSenderId: "892302063818",
  appId: "1:892302063818:web:73e89671fcea4be3e95c33",
  measurementId: "G-JLT8HNS31T",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

let messaging;
if (firebase.messaging.isSupported()) {
  messaging = firebase.messaging();

  // Handle background messages
  messaging.onBackgroundMessage(function (payload) {
    console.log("Received background message ", payload);

    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: "../Images/smallLogo.png", // Make sure the icon path is correct
      data: payload.data, // This passes any additional data sent with the notification
    };

    // Display the notification
    self.registration.showNotification(notificationTitle, notificationOptions);
  });
}

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const payload = event.notification.data;
  const data = payload?.FCM_MSG?.data?.data
    ? JSON.parse(payload?.FCM_MSG?.data?.data)
    : {};
  const patient_id = data?.patient_id ? btoa(data?.patient_id) : null;
  const event_id = data?.event_id ? btoa(data?.event_id) : null;

  let url;

  if (
    payload?.FCM_MSG?.data?.action === "open_request" ||
    payload?.action === "open_request"
  ) {
    url = "/admin/requests";
  } else if (
    (payload?.FCM_MSG?.data?.action === "patient_overview" ||
      payload?.action === "patient_overview") &&
    patient_id
  ) {
    url = `/patient/details?patient_id=${patient_id}&event_id=${event_id}`;
  } else {
    url = "/home";
  }

  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      let client = clients.find((client) => client.url === self.origin + url);

      if (client) {
        // Focus on the already open window/tab
        client.focus();
      } else {
        // Open a new window/tab with the specified URL
        self.clients.openWindow(url);
      }
    })
  );
});

// Service Worker installation and activation
self.addEventListener("install", (event) => {
  console.log("Service Worker installing...");
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker activating...");
});

// Handle fetch events and offline notifications
self.addEventListener("fetch", (event) => {
  if (!navigator.onLine) {
    event.waitUntil(
      self.registration.showNotification("No Internet", {
        body: "You are offline. Please check your internet connection.",
      })
    );

    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request.clone());
      })
    );
  }
});
