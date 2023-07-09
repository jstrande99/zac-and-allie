import React, { useState, useEffect } from 'react';
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/storage";
import "firebase/compat/auth";
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


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
// const firestore = firebase.firestore();
const storage = firebase.storage();

const CameraGallery = (activeUser) => {
    const [allImages, setAllImages] = useState([]);
    useEffect(() => {
		const fetchAllImages = async () => {
			const getAllImages = async (ref, imageUrls = []) => {
				const listResult = await ref.listAll();

				for (const item of listResult.items) {
					if (item instanceof firebase.storage.Reference) {
					// Add download URL if the item is a file
					const downloadURL = await item.getDownloadURL();
					imageUrls.push(downloadURL);
					}
				}

				for (const prefix of listResult.prefixes) {
					// Recursive call for each subdirectory (prefix)
					imageUrls = await getAllImages(prefix, imageUrls);
				}

				return imageUrls;
			};

			const storageRef = storage.ref().child("Camera");
			const allImageUrls = await getAllImages(storageRef);
			setAllImages(allImageUrls)
		}
		fetchAllImages(); 
	},[]);
    
    return (
        <div>
			<div className='gallShow'></div>
			{allImages.map((imageUrl, index) => (
				<div 
					key={index} 
					className="rowDiv" 
				>
					<img 
						src={imageUrl} 
						alt={`Images ${index}`} 
						className='gallery filter-vintage'
					/>
				</div>
        	))}
			<div className='gallShow'></div>
		</div>
    )
}
export default CameraGallery;