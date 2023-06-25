importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js");
importScripts("firebase-config.js");
// importScripts("https://www.gstatic.com/firebasejs/7.14.1/firebase-app.js");
// importScripts("https://www.gstatic.com/firebasejs/7.14.1/firebase-messaging.js");
firebase.initializeApp(firebaseConfig);
// firebase.initializeApp({
//     apiKey: "AIzaSyC4SrgxULcLC8pa5oz2wSlI6DOUhVC_kEQ",
//     authDomain: "zacandallie-ab1dd.firebaseapp.com",
//     projectId: "zacandallie-ab1dd",
//     storageBucket: "zacandallie-ab1dd.appspot.com",
//     messagingSenderId: "418662880538",
//     appId: "1:418662880538:web:db6999cafdd18ec70f08a3",
//     measurementId: "G-TKMMJJLDH3"
// });

// firebase.messaging();

// /* global importScripts */
// importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
// importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');

/* global firebase */
// firebase.initializeApp({
//     messagingSenderId: "418662880538"
// });

const messaging = firebase.messaging();

if ("serviceWorker" in navigator) {
    navigator.serviceWorker
      .register("/firebase-messaging-sw.js")
      .then(function(registration) {
        console.log("Registration successful, scope is:", registration.scope);
      })
      .catch(function(err) {
        console.log("Service worker registration failed, error:", err);
      });
  }

// messaging.onBackgroundMessage(payload => {
//   console.log('Received background message ', payload);
//   const notificationTitle = payload.notification.title;
//   const notificationBody ={ 
//     body: payload.notification.body,
//   }
//   self.registeration.showNotification(notificationTitle, notificationBody);
// });

// self.addEventListener('push', event => {
//   const payload = event.data.json();
//   console.log('Received background message ', payload);
//   const notificationTitle = payload.notification.title;
//   const notificationBody = payload.notification.body;
//   const customValue = payload.data.customKey;

//   // Process the notification and custom data as needed
//   // Show notification, etc.
//   self.registration.showNotification(notificationTitle, {
//     body: notificationBody,
//     // Add any other notification options as needed
//   });
// });

self.addEventListener('push', event => {
  const payload = event.data.json();
  const notificationTitle = payload.notification.title;
  const notificationBody = payload.notification.body;
  const customValue = payload.data.customKey;
  const url = payload.data.url;
  const imageUrl = payload.notification.image;

  // Show notification
  self.registration.showNotification(notificationTitle, {
    body: notificationBody,
    icon: imageUrl,
    // Add any other notification options as needed
  });

  // Handle custom data
  console.log('push Custom Value:', customValue);
});

self.addEventListener('notificationclick', event => {
  event.notification.close(); // Close the notification
  const url = event.notification.data.url;
  if (url) {
    event.waitUntil(
      clients.openWindow(url) // Open the URL in a new window/tab
    );
  }
});

self.addEventListener('backgroundmessage', event => {
  const payload = event.data.json();
  const notificationTitle = payload.notification.title;
  const notificationBody = payload.notification.body;
  const customValue = payload.data.customKey;

  // Show background notification
  self.registration.showNotification(notificationTitle, {
    body: notificationBody,
    // Add any other notification options as needed
  });

  // Handle custom data
  console.log('bg Custom Value:', customValue);
  // Perform actions based on the custom data
});

messaging.onBackgroundMessage(payload => {
  const notificationTitle = payload.notification.title;
  const notificationBody = payload.notification.body;
  const customValue = payload.data.customKey;

  // Process the notification and custom data as needed
  // Show notification, etc.
  self.registration.showNotification(notificationTitle, {
    body: notificationBody,
    // Add any other notification options as needed
  });
  console.log('push Custom Value:', customValue);
});
