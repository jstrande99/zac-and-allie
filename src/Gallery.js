import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import "firebase/compat/auth";
import { getToken, onMessage } from "firebase/messaging";
import { getMessaging } from "firebase/messaging/sw";
import "./Gallery.css";
import Navbar from "./Navbar";
import Signature from "./Signature";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_KEY,
  authDomain: "zacandallie-ab1dd.firebaseapp.com",
  projectId: "zacandallie-ab1dd",
  storageBucket: "zacandallie-ab1dd.appspot.com",
  messagingSenderId: "418662880538",
  appId: "1:418662880538:web:db6999cafdd18ec70f08a3",
  measurementId: "G-TKMMJJLDH3"
};

firebase.initializeApp(firebaseConfig);
const storage = firebase.storage();

export default function Gallery(props) {
  const [images, setImages] = useState([]);
  const [showImage, setShowImage] = useState(false);
  const [selectedImage, setSelectedImage] = useState("");

  const initializeMessaging = async () => {
    const messaging = getMessaging();
    const token = await getToken(messaging, {
      vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY
    });
    console.log("FCM token:", token);

    onMessage((payload) => {
      // Handle incoming notification message
      const notification = payload.notification;
      const { click_action } = notification;

      // You can customize the behavior when the notification is received
      // For example, you can open the URL specified in the click_action
      console.log("Received notification:", notification);

      // Open the URL in a new window/tab
      window.open(click_action, "_blank");
    });

    // The topic name can be optionally prefixed with "/topics/".
    const topic = "Hello World!";

    const message = {
      data: {
        'title': 'Hello Jordan!',
        'body': 'You Did it!',
      },
      topic: `/topics/${topic}`
    };

    try {
      const response = await fetch('https://fcm.googleapis.com/fcm/send', {
  'method': 'POST',
  'headers': {
    'Authorization': 'key=AAAAYXpAlRo:APA91bHzwrK_IuurTh_a1bQp0qvrb0bzGd3cRwR_SYw0JU6jzo4wyy3qtzt82gItgue7TCBqe1YIRybdHCCsyz1D4Pwsa0TH7Z1YIXDLMtckDiqSU8l0ZIFaABXu3yonYBep8EyxaNb6',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
      notification: {
        title: 'Hello World',
        body: 'Jordan!',
        image: 'https://images.squarespace-cdn.com/content/v1/609701bc21f2ee5734517421/1636866272048-ENR4FC4KT4SY0HCWGL9Q/Champagne+Glass+Toast+Cover+1+WM.jpg?format=1500w'
      },
      data: {
        customKey: 'customValue', 
        url: 'https://github.com/firebase/quickstart-js/blob/master/messaging/README.md'
      },
      to: token,
      content_available: true,
  })
}).then(function(response) {
  console.log(response);
}).catch(function(error) {
  console.error(error);
})
      console.log("Successfully sent message:", response);
    } catch (error) {
      console.log("Error sending message:", error);
    }
  };

  useEffect(() => {
    props.setTimer(500);
  }, [props]);

  useEffect(() => {
    const fetchImages = async () => {
      const storageRef = storage.ref();
      const imageUrls = [];

      const imageList = await storageRef.child("images").listAll();

      imageList.items.forEach((item) => {
        item.getDownloadURL().then((url) => {
          imageUrls.push(url);
          setImages([...imageUrls]);
        });
      });
    };

    fetchImages();
    initializeMessaging(); // Call initializeMessaging here
  }, []);

//   useEffect(() => {
//     const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
//       navigator.userAgent
//     );

//     if (isMobileDevice) {
//       const url = window.location.href;
//       const messaging = getMessaging();

//       getToken(messaging, { vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY })
//         .then((currentToken) => {
//           if (currentToken) {
//             const notification = {
//               title: "Access the page on your mobile device",
//               body: `Click here to open the page: ${url}`,
//               click_action: url
//             };

//             const message = {
//               notification,
//               token: currentToken
//             };

//             return message.send(message);
//           } else {
//             console.log("No registration token available.");
//           }
//         })
//         .catch((error) => {
//           console.log("An error occurred while retrieving token.", error);
//         });
//     }
//   }, []);
  const handleFullImage = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImage(true);
  };

  return (
    <>
      <div className="container">
        <Navbar {...props} />
        <div className="spacer"></div>
        {showImage && (
          <div className="fullscreen-container" onClick={() => setShowImage(false)}>
            <img src={selectedImage} alt="fullscreen" className="fullscreen-image" />
          </div>
        )}
        {images.map((imageUrl, index) => (
          <div
            key={index}
            className="rowDiv"
            onClick={() => handleFullImage(imageUrl)}
          >
            <img src={imageUrl} alt={`Images ${index}`} className="gallery" />
          </div>
        ))}
      </div>
      <Signature />
    </>
  );
}
