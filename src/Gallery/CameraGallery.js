import React, { useState, useEffect } from 'react';
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/storage";
import "firebase/compat/auth";
import "./CameraGallery.css"


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

const CameraGallery = () => {
    const [allImages, setAllImages] = useState([]);
    const [showFullImage, setShowFullImage] = useState(false);
    const [imageSelected, setImageSelected] = useState("");
    // useEffect(() => {
	// 	if (showFullImage) {
	// 	document.body.style.position = "fixed";
	// 	} else {
	// 	document.body.style.position = "static";
	// 	}
  	// }, [showFullImage]);
    useEffect(() => {
        const fetchImages = async () => {
        const storageRef = storage.ref();
        const imageUrls = [];

        const imageList = await storageRef.child('Camera').listAll();

        imageList.items.forEach((item) => {
            item.getDownloadURL().then((url) => {
            imageUrls.push(url);
            setAllImages([...imageUrls]);
            });
        });
        };

        fetchImages();
    }, []);
    const handleShowFullImage = (imageUrl) => {
        setImageSelected(imageUrl);
        setShowFullImage(true);
    }
    return (
        <div className="galleryContainer">
            {showFullImage && (
                <div 
                    className="fullscreen-c" 
                    onClick={() => setShowFullImage(false)}
                >
                    <img 
                        src={imageSelected} 
                        alt="fullscreen" 
                        className="fullscreen filter-vintage" 
                    />
                </div>
            )}
            {allImages.map((imageUrl, index) => (
                <div 
                    key={index} 
                    className="galleryItem"
                    onClick={() => handleShowFullImage(imageUrl)}
                >
                    <img 
                        src={imageUrl} 
                        alt={`Images ${index}`} 
                        className="galleryImage filter-vintage" 
                    />
                </div>
            ))}
        </div>
    );
};

export default CameraGallery;