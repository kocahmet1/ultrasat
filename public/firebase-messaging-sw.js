// Firebase Cloud Messaging Service Worker
// This file must be placed in the root of the public directory

// Import and configure the Firebase SDK
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.6.1/firebase-messaging-compat.js');

// Your web app's Firebase configuration
// This should match the config in your app
firebase.initializeApp({
  apiKey: "AIzaSyBShu68xQq8--RsaB0odS4Mj_W09iYB8rw",
  authDomain: "ultrasat-5e4c4.firebaseapp.com",
  projectId: "ultrasat-5e4c4",
  storageBucket: "ultrasat-5e4c4.firebasestorage.app",
  messagingSenderId: "452991160669",
  appId: "1:452991160669:web:3039103563d6177e1258b4"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo192.png'
  };

  // Show the notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click ', event);
  
  // Close the notification
  event.notification.close();
  
  // This looks to see if the current window is already open and focuses if it is
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    })
    .then((clientList) => {
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if (client.url.includes('/dashboard') && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no open window, open a new one
      if (clients.openWindow) {
        return clients.openWindow('/dashboard');
      }
    })
  );
});
