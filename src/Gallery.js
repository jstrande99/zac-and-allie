import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import "firebase/compat/auth";
import "./Gallery.css";
import { Link } from "react-router-dom";

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

export default function Gallery(){
    const [images, setImages] = useState([]);
    const [showImage, setShowImage] = useState(false);
    const [selectedImage, setSelectedImage] = useState("");

    useEffect(() => {
        const fetchImages = async () => {
        const storageRef = storage.ref();
        const imageUrls = [];

        const imageList = await storageRef.child('images').listAll();

        imageList.items.forEach((item) => {
            item.getDownloadURL().then((url) => {
            imageUrls.push(url);
            setImages([...imageUrls]);
            });
        });
        };

        fetchImages();
    }, []);

    const handleFullImage = (imageUrl) => {
        setSelectedImage(imageUrl);
        setShowImage(true);
    }
    return (
        <div className="container">
            <Link to='/' className="nav-links">
                <button className="submit gal">Back</button>
            </Link>
            {showImage && (
            <div className="fullscreen-container" onClick={() => setShowImage(false)}>
            <img src={selectedImage} alt="fullscreen" className="fullscreen-image" />
            </div>
        )}
        {images.map((imageUrl, index) => (
            <div key={index} className="rowDiv" onClick={() => handleFullImage(imageUrl)}>
            <img src={imageUrl} alt={`Images ${index}`} className='gallery'/>
            </div>
        ))}
        </div>
    );
};
