import React, { useState, useEffect, useRef } from 'react';
import { Camera, FACING_MODES } from 'react-html5-camera-photo';
import 'react-html5-camera-photo/build/css/index.css';
import './Camera.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import Navbar from "./Navbar";
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
// const firestore = firebase.firestore();
const storage = firebase.storage();

export default function Cameras(props) {
	const [isFrontCamera, setIsFrontCamera] = useState(FACING_MODES.ENVIRONMENT);
	const [timer, setTimer] = useState(false);
	const [allImages, setAllImages] = useState([]);
	const [showGallery, setShowGallery] = useState(true);
	let len = useRef(0);

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
	},[showGallery]);
	console.log(allImages)

	useEffect(() => {
		const fetchImages = async () =>{
			//Add to camera/name
			const imagesList = await storage.ref().child(`Camera/${props.name}`).listAll();
			const downloadURLPromises = imagesList.items.map((item) => item.getDownloadURL());
			const imageUrls = await Promise.all(downloadURLPromises);
			len.current = imageUrls.length;		
		};
		fetchImages();
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
			const nameY = canvas.height - 70;
			context.fillText(timestamp, canvas.width - 10, nameY);
			context.fillStyle = 'rgb(213, 138, 0)';
			context.textAlign = 'left';
			// Add props.name to the upper left corner
			context.font = 'bold 90px Arial';
			const nameText = props.name;
			const nameX = 10;
			// const nameY = 70;
			context.fillText(nameText, nameX, nameY);
			const editedDataUri = canvas.toDataURL('image/jpeg');
			// setImageData(editedDataUri);
			
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
	const handleShowGallery = () => {
		setShowGallery(!showGallery);
	}
	
	return (
		<div>
		{showGallery ?
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
			<button className='gall' onClick={handleShowGallery}>
				<FontAwesomeIcon icon={["fas","fa-images"]} fontSize="1.8em" />
			</button>
			<Link to='/'>
				<button  className="gallHome">
					<FontAwesomeIcon icon={['fas','fa-house']} fontSize="1.8em"/>
				</button>
			</Link>
			{/* <Navbar {...props}/> */}
		</div> 
		:
			<div>
				<div className='gallNav'>
					<button className='gallHomeLeft' onClick={handleShowGallery}>
						<FontAwesomeIcon icon={['fa-solid','fa-camera']} fontSize="1.8em"/>
					</button>
					<Link to='/'>
						<button  className="gallHomeRight">
							<FontAwesomeIcon icon={['fas','fa-house']} fontSize="1.8em"/>
						</button>
					</Link>
				</div>
				<div className='gallShow'></div>
				{allImages.map((imageUrl, index) => (
					<div 
						key={index} 
						className="rowDiv" 
					>
						<img 
							src={imageUrl} 
							alt={`Images ${index}`} 
							className='gallery'
						/>
					</div>
            	))}
				<div className='gallShow'></div>
			</div>
		}
		</div>
	);
	}
