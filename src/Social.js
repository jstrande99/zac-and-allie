import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/storage";
import "firebase/compat/auth";
import imageCompression from 'browser-image-compression';
import heic2any from "heic2any";
import { Link } from "react-router-dom";
import Signature from "./Signature";
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Logout } from "./Logout";
import './Social.css';

library.add(fas);
library.add(far);

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

export default function Social(props) {
	const [text, setText] = useState("");
	const sortBy = 'createdAt';
	const [posts, setPosts] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [imageFiles, setImageFiles] = useState([]);
	const [clickedImg, setClickedImg] = useState(0); 
	const [clickedImgIndex, setClickedImgIndex] = useState(0);
	const [createPost, setCreatePost] = useState("Post");
	const [isDisabled, setIsDisabled] = useState(false);
	const [isAdmin, setIsAdmin] = useState(false);
	const [currentUsers, setCurrentUsers] = useState(0);
	let activeUser = props.name;

	const [touchStart, setTouchStart] = useState(null);
	const [touchEnd, setTouchEnd] = useState(null);

	const minSwipeDistance = 50;

	useEffect(() => {
		const adminNames = [
			"zac strande", 
			"allie strande", 
			"jordan strande", 
			"dae judd", 
			"bill strande",
			 "charlotte strande"
		];
		setLoading(true);
		adminNames.forEach((user) => {
			if(activeUser.toLowerCase() === user){
				setIsAdmin(true);
			}
		})
		firestore.collection("users").doc(activeUser.toLowerCase()).set({
			user: activeUser
		});
		firestore.collection('users').get().then(snap => setCurrentUsers(snap.size));
		const unsubscribe = firestore.collection("posts")
			.orderBy(sortBy, "desc")
			.onSnapshot(snapshot => {
				const updatedPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
				setTimeout(() => { // add delay here
					setPosts(updatedPosts);
					setLoading(false);
				}, props.timer);
			}, error => {
				setError(error);
				setLoading(false);
		  	});
		return unsubscribe;
	}, [activeUser, props.timer]);

	useEffect(() => {
		firestore.collection("posts.text").onSnapshot(() => {
		window.scrollTo(0, 0); //document.body.scrollHeight
		});
	}, []);

	const handleSubmit = async (event) => {
		event.preventDefault();
		if(!text && !imageFiles.length){
			alert("Please enter a memory or select an image!");
			return;
		}

		setCreatePost("Posting...");
		setIsDisabled(true);
		let imageUrls = [];

		const options = {
			maxSizeMB: 1,
			maxWidthOrHeight: 1920
		}
		if(imageFiles.length > 0){
			for(let i = 0; i < imageFiles.length; i++){
				let imageFile = imageFiles[i];
				let fileName = imageFile.name;
				let actualName = fileName.split('.')[0];
				const ext = fileName.split('.').pop().toLowerCase();

				if (ext === 'heic') {
					setCreatePost("Converting...");
					const jpegBlob = await heic2any({ blob: imageFile });
					const jpegFile = new File([jpegBlob], `${actualName}.jpeg`, { type: 'image/jpeg' });
					imageFile = jpegFile;
				} 

				try {
					setCreatePost("Compressing...");
					const compressedFile = await imageCompression(imageFile, options);
					const storageRef = storage.ref().child(`images/${compressedFile.name}`);
					await storageRef.put(compressedFile);
					const imageUrl = await storageRef.getDownloadURL();
					imageUrls.push(imageUrl);
				  } catch (error) {
					console.log(error);
				  }
			}
		}

		firestore.collection("posts").add({
			text,
			imageUrls,
			createdAt: firebase.firestore.FieldValue.serverTimestamp(),
			creator: activeUser,
			likes: 0,
		}).then((docRef) => {
			docRef.set({ id: docRef.id }, { merge: true });
		});
		setText("");
		setImageFiles([]);
		setCreatePost("Post");
		setIsDisabled(false);
	};
	
	const handleImageChange = (event) => {
		setImageFiles(event.target.files);
	};
  
	if (loading) {
		return (
			<div className={`fullscreen-${loading}`}>
				<div className='innerLoading'>
					<h2 className="loadTtl">Allie & Zac</h2>
                    <p>Share the fun photos and memories that you have of the loving couple and the special night!<br/><br/>Please keep them appropriate!</p>
				</div>
			</div>
		)
	}

	if (error) {
		return <div>Error: {error.message}</div>;
	}

	const handleClick = (index, len, direction) => {
		if (clickedImg === index) {
			if(direction === 1){
				setClickedImgIndex((clickedImgIndex + 1) % len); 
			}else{
				setClickedImgIndex((clickedImgIndex - 1 + len) % len); 
			}
		} else {
			setClickedImg(index); 
			if(direction === 1){
				setClickedImgIndex(1); 
			}else{
				setClickedImgIndex(len - 1);  
			} 
		}
	};
	
	const handleDelete = async (postId) => {
		if(isAdmin){
			try {
				await firestore.collection("posts").doc(postId).delete();
			  } catch (error) {
				console.error("Error removing document: ", error);
			  }
		}
	};

	const onTouchStart = (e) => {
		setTouchEnd(null);
		setTouchStart(e.targetTouches[0].clientX);
	}

	const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

	const onTouchEnd = (index, len) => {
		if (!touchStart || !touchEnd) return;
		if(len <= 1) return;
		const distance = touchStart - touchEnd;
		const isLeftSwipe = distance > minSwipeDistance;
		const isRightSwipe = distance < -minSwipeDistance;
		if (isLeftSwipe || isRightSwipe) {
			if (clickedImg === index) {
				if (isLeftSwipe ) {
					setClickedImgIndex((clickedImgIndex + 1) % len); 
				} else if (isRightSwipe) {
					setClickedImgIndex((clickedImgIndex - 1 + len) % len); 
				}
			}else {
				setClickedImg(index); 
				if(isLeftSwipe){
					setClickedImgIndex(1); 
				}else{
					setClickedImgIndex(len - 1);  
				} 
			}
		}
	}

	const handleLike = async (post) => {
		const postRef = firestore.collection("posts").doc(post.id);
		const doc = await postRef.get();
		if (doc.exists) {
			if(post.clientLike && post.clientLike.includes(activeUser)){
				return;
			}
			if(post.creator === activeUser){
				return;
			}
			postRef.update({
				likes: post.likes + 1,
				clientLike: firebase.firestore.FieldValue.arrayUnion(activeUser),
			});
		} else {
			console.log("Document does not exist!");
		}
	};

	return (
		<div className="body">
			<div className="userbar">
				{isAdmin && (<Link to='/Gallery' className="nav-links">
                	<button className="submit gal">
						<FontAwesomeIcon icon={["fas","fa-images"]} fontSize="1.5em"/>
					</button>
				</Link>)}
				<Link to='/Schedule' className="nav-links">
					<button className="submit gal">
						<FontAwesomeIcon icon={['fas','fa-calendar-alt']} fontSize="1.5em"/>
					</button>
				</Link>
				<Link to='/' className="nav-links">
					<button className="submit gal">
						<FontAwesomeIcon icon={['fas','fa-house']} fontSize="1.5em"/>
					</button>
				</Link>
				{isAdmin && 
					(<p>
						<FontAwesomeIcon icon={["fas", "fa-users"]} fontSize="1.5em"/> : {currentUsers}
					</p>)}
				<button className="logout" onClick={() => Logout({...props})}>
					<FontAwesomeIcon icon={['fas','fa-right-from-bracket']} fontSize="1.5em" />
				</button>
			</div>
			<p className="welcoming">Welcome {activeUser}!</p>
			<form onSubmit={handleSubmit}>
				<input 
					className="textBox" 
					type="text" 
					value={text} 
					onChange={(e) => setText(e.target.value)} 
					placeholder="Write to the happy couple..."
				/>
				<input 
					type="file" 
					className="imgInput" 
					name="imageFile" 
					accept="image/* image/heic" 
					onChange={handleImageChange} multiple
				/>
				<button 
					className="submit postBtn" 
					type="submit"
					disabled={isDisabled} 
				>
						{createPost}
				</button>
			</form>
			{posts.map((post, index) => (
				<div 
					key={index} 
					className="posts postText" 
					data-date={post.createdAt ? post.createdAt.toDate().toLocaleDateString() : ''}
				>
					<p className="creator">
						{post.creator}
					</p>
					<div className="imgClick" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={() => onTouchEnd(index, post.imageUrls.length)}>
						{post.imageUrls && post.imageUrls.length > 1 && 
							(<div className="nextdiv" onClick={() => handleClick(index, post.imageUrls.length, 1)}>
								<h1 className="nextBtn arrowBtn">&#8250;</h1>
							</div>)
						}
						{post.imageUrls && post.imageUrls.length > 1 && 
							(<div className="backdiv" onClick={() => handleClick(index, post.imageUrls.length, 0)}>
								<h1 className="backBtn arrowBtn">&#8249;</h1>
							</div>)
						}
						{post.imageUrls && post.imageUrls.length > 0 && clickedImg === index && (
							<img src={post.imageUrls[clickedImgIndex]} alt={`Uploaded by ${post.creator}`} className="img"/>
						)}
						{post.imageUrls && post.imageUrls.length > 0 && clickedImg !== index && (
							<img src={post.imageUrls[0]} alt={`Uploaded by ${post.creator}`} className="img"/>
						)}
					</div>
					{post.imageUrls.length !== 0 && 
						(<p className="indicator">
							{clickedImg === index ? clickedImgIndex + 1 : 1} of {post.imageUrls ? post.imageUrls.length : 0}
						</p>)
					}
					{post.text && 
						<p className="textPost">{post.text}</p>
					}
					<div className="post-btns">
						{isAdmin ? 
							(<button className="deleteBtn" onClick={() => handleDelete(post.id)}>
								<FontAwesomeIcon icon="fa-solid fa-trash" fontSize="1.5em"/>
							</button>) : 
							(<button className="deleteBtn"></button>)
						}
						{(post.clientLike && post.clientLike.includes(activeUser)) || post.creator === activeUser ? 
							<button onClick={() => handleLike(post) } className="deleteBtn">
								<FontAwesomeIcon icon={{prefix: 'fas', iconName: 'heart'}} fontSize="2em"/> {post.likes} 
							</button>
							: 
							<button onClick={() => handleLike(post) } className="deleteBtn">
								<FontAwesomeIcon icon={{prefix: 'far', iconName: 'heart'}} fontSize="2em" /> {post.likes} 
							</button>
						}
					</div>
				</div>
			))}
			<Signature/>
		</div>
	);
}