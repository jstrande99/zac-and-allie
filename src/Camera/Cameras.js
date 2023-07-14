import React, { useState, useEffect, useRef } from 'react';
import { Camera, FACING_MODES } from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';
import './Camera.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/storage";
import "firebase/compat/auth";
import imageCompression from 'browser-image-compression';
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

export default function Cameras(props) {
	const [isFrontCamera, setIsFrontCamera] = useState(FACING_MODES.ENVIRONMENT);
	const [timer, setTimer] = useState(false);
	let len = useRef(0);

	useEffect(() => {
		const fetchImages = async () =>{
			const imagesList = await storage.ref().child(`Camera`).listAll();
			const downloadURLPromises = imagesList.items.map((item) => item.getDownloadURL());
			const imageUrls = await Promise.all(downloadURLPromises);
			len.current = imageUrls.length;	
			props.setTimer(0);	
		};
		fetchImages();
	}, [props, timer]);

	const handleTakePhoto = async (dataUri) => {
		const timestamp = new Date().toLocaleString();
		const canvas = document.createElement('canvas');
		const context = canvas.getContext('2d');

		const image = new Image();
		image.onload = async () => {
			canvas.width = image.width;
			canvas.height = image.height;
			context.filter = 'sepia(0.4) contrast(1.2) brightness(0.9) saturate(1.5)';
			context.drawImage(image, 0, 0);
			context.font = 'bold 80px Arial';
			context.fillStyle = 'rgb(213, 138, 0)';
			context.textAlign = 'right';
			const nameY = canvas.height - 70;
			context.fillText(timestamp, canvas.width - 10, nameY);
			context.fillStyle = 'rgb(213, 138, 0)';
			context.textAlign = 'left';
			// Add props.name to the upper left corner
			context.font = 'bold 90px Arial';
			const nameText = props.name;
			const nameX = 10;
			context.fillText(nameText, nameX, nameY);
			const editedDataUri = canvas.toDataURL('image/jpeg');
			
			const options = {
				maxSizeMB: 1,
				maxWidthOrHeight: 1920
			};
			try {
				const blob = dataUriToBlob(editedDataUri);
				const compressedFile = await imageCompression(blob, options);
				const imageName = `${props.name}_${len.current}.jpg`;
				const storageRef = storage.ref().child(`Camera/${imageName}`);
				await storageRef.put(compressedFile);
				setTimer(!timer);
			} catch (error) {
				console.log(error);
			}
		};
		image.src = dataUri;
	};

	const dataUriToBlob = (dataUri) => {
		const byteString = atob(dataUri.split(',')[1]);
		const mimeString = dataUri.split(',')[0].split(':')[1].split(';')[0];
		const ab = new ArrayBuffer(byteString.length);
		const ia = new Uint8Array(ab);

		for (let i = 0; i < byteString.length; i++) {
			ia[i] = byteString.charCodeAt(i);
		}

		return new Blob([ab], { type: mimeString });
	};

	const handleCameraToggle = () => {
		setIsFrontCamera(isFrontCamera === FACING_MODES.ENVIRONMENT ? FACING_MODES.USER : FACING_MODES.ENVIRONMENT);
	};
	
	return (
		<div className='cameraArea'>
			<Camera
				onTakePhoto={handleTakePhoto}
				idealFacingMode={isFrontCamera}
				imageCompression={0.97}
				isMaxResolution={true}
				isImageMirror={false}
				isSilentMode={false}
				isDisplayStartCameraError={true}
				isFullscreen={false}
				className='preview'
			/>
			<button onClick={handleCameraToggle} className='reverse'>
				<FontAwesomeIcon icon={['fa-solid', 'fa-camera-rotate']} fontSize='1.8em' />
			</button>
			<Link to='/'>
				<button  className="gallHome">
					<FontAwesomeIcon icon={['fas','fa-house']} fontSize="1.8em"/>
				</button>
			</Link>
		</div> 
	);
}
