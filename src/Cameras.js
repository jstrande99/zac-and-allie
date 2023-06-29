import React, { useState, useEffect, useRef } from 'react';
import { Camera, FACING_MODES } from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';
import './Camera.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Navbar from "./Navbar";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/storage";
import "firebase/compat/auth";
import imageCompression from 'browser-image-compression';

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
const firestore = firebase.firestore();
const storage = firebase.storage();

export default function Cameras(props) {
	const [imageData, setImageData] = useState(null);
	const [isFrontCamera, setIsFrontCamera] = useState(FACING_MODES.ENVIRONMENT);
	const [timer, setTimer] = useState(false);
	let len = useRef(0);

	useEffect(() => {
		const fetchImages = async () =>{
		const imagesList = await storage.ref().child(`Camera/${props.name}`).listAll();
		const downloadURLPromises = imagesList.items.map((item) => item.getDownloadURL());
		const imageUrls = await Promise.all(downloadURLPromises);
		len.current = imageUrls.length;
		if(imageUrls.length === 10){
		firestore
			.collection("camera")
			.doc(props.name)
			.add({
			imageUrls: [...imageUrls],
			creator: props.name
			}).then((docRef) => {
				docRef.update({ id: docRef.id }, { merge: true });
			});
			console.log('added to posts');
		}
		
		};
		fetchImages();
		console.log(len.current);
	}, [props.name, timer]);

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
			context.fillText(timestamp, canvas.width - 10, 60);
			context.fillStyle = 'rgb(213, 138, 0)';
			context.textAlign = 'left';
			// Add props.name to the upper left corner
			const nameText = props.name;
			const nameX = 10;
			const nameY = 60;
			context.fillText(nameText, nameX, nameY);
			const editedDataUri = canvas.toDataURL('image/jpeg');
			setImageData(editedDataUri);
			
			const options = {
				maxSizeMB: 1,
				maxWidthOrHeight: 1920
			};
			try {
				const blob = dataUriToBlob(editedDataUri);
				const compressedFile = await imageCompression(blob, options);
				const imageName = `${props.name}_${len.current}.jpg`;
				const storageRef = storage.ref().child(`Camera/${props.name}/${imageName}`);
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
		<div>
		{len.current < 9 ?
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
			<FontAwesomeIcon icon={['fa-solid', 'fa-camera-rotate']} size='2xl' />
			</button>
		</div> 
		:
			<div>
				<h2>Captured Image:</h2>
				<img src={imageData} alt="Captured" style={{ width: '100%' }} className='filter-vintage'/>
			</div>
		}
		<Navbar />
		</div>
	);
	}
