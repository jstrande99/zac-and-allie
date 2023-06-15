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

	const [isLiked, setIsLiked] = useState(false);
	const [likedIndex, setLikedIndex] = useState(null);

	const [touchStart, setTouchStart] = useState(null);
	const [touchEnd, setTouchEnd] = useState(null);

	const [addPostOpen, setAddPostOpen] = useState(false);

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
		const accessTimes = new Date();
		firestore.collection("users").doc(activeUser.toLowerCase()).set({
			user: activeUser,
			accessTime: accessTimes, // TO BE REMOVED BEFORE RELEASE
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
		window.scrollTo(0, 0);
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
		if(imageFiles.length === 0 && text){
			setAddPostOpen(!addPostOpen);
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
			setAddPostOpen(!addPostOpen);
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
				setIsLiked(false);
				return;
			}
			if(post.creator === activeUser){
				setIsLiked(false);
				return;
			}
			postRef.update({
				likes: post.likes + 1,
				clientLike: firebase.firestore.FieldValue.arrayUnion(activeUser),
			});
		} else {
			console.log("Document does not exist!");
		}
		setTimeout(() => {
			setIsLiked(false);
		}, 4000);

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
				<button 
					className="submit gal" 
					onClick={() => setAddPostOpen(!addPostOpen)}
				>
					<FontAwesomeIcon icon="fa-regular fa-square-plus" fontSize="2em"/>
				</button>
				{isAdmin && 
					(<p>
						<FontAwesomeIcon icon={["fas", "fa-users"]} fontSize="1.5em"/> : {currentUsers}
					</p>)}
				<button className="logout" onClick={() => Logout({...props})}>
					<FontAwesomeIcon icon={['fas','fa-right-from-bracket']} fontSize="1.5em" />
				</button>
			</div>
			<p className="welcoming">Welcome {activeUser}!</p>
			{addPostOpen ?
				(<div className="popupContainer"><div  className="popupForm"> 
					<form onSubmit={handleSubmit}>
						<button 
							onClick={()=> setAddPostOpen(!addPostOpen)}
							className="exitBtn deleteBtn"
						>
							<FontAwesomeIcon icon="fa-solid fa-xmark" fontSize="2.5em" />
						</button>
						<h2>ADD POST</h2>
						<div className="line"></div>
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
							className=" postBtn" 
							type="submit"
							disabled={isDisabled} 
						>
								{createPost}
						</button>
					</form>
				</div></div>) : (<div></div>)
			}
			{posts.map((post, index) => (
				<div 
					key={index} 
					className="posts postText" 
					data-date={post.createdAt ? post.createdAt.toDate().toLocaleDateString() : ''}
				>	<div className="post-btns">
					<p className="creator">
						{post.creator}
					</p>
					{(post.clientLike && post.clientLike.includes(activeUser)) || post.creator === activeUser ? 
						<button onClick={() => handleLike(post) } className="deleteBtn heartBtn">
							<FontAwesomeIcon icon={{prefix: 'fas', iconName: 'heart'}} fontSize="2em"/> {post.likes} 
						</button>
						: 
						<button onClick={() => { setLikedIndex(index); setIsLiked(!isLiked); handleLike(post);} } className="deleteBtn heartBtn">
							<FontAwesomeIcon icon={{prefix: 'far', iconName: 'heart'}} fontSize="2em" /> {post.likes} 
						</button>
					}
					</div>
					<div onDoubleClickCapture={() => {setLikedIndex(index); setIsLiked(!isLiked); handleLike(post);}}>
					<div className="imgClick" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={() => onTouchEnd(index, post.imageUrls.length)}>
						{isLiked && likedIndex === index && 
							(<div className="popuplikecontainer">
								<p className="popupLike"><FontAwesomeIcon icon={{prefix: 'fas', iconName: 'heart'}} fontSize="5em" beatFade/> </p>
								<p className="popupLike2"><FontAwesomeIcon icon={{prefix: 'fas', iconName: 'heart'}} fontSize="7em" beatFade/> </p>
							</div>)}
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
					</div>
					<div className="indicator">
						{post.imageUrls && post.imageUrls.length > 1 &&
							post.imageUrls.map((_, imageIndex) => (
							<span
								key={imageIndex}
								className={`circle ${clickedImg === index ?
									clickedImgIndex === imageIndex ? 
										'solid' : 'open' 
									: imageIndex === 0 ?
										'solid' : 'open' 
								}`}
							/>
						))}
					</div>
					{post.text ?
						<p className="textPost" onDoubleClickCapture={() => {setLikedIndex(index); setIsLiked(!isLiked); handleLike(post);}}>{post.text}</p>
						:
						<p></p>
					}
					{isAdmin ? 
						(<button className="deleteBtn" onClick={() => handleDelete(post.id)}>
							<FontAwesomeIcon icon="fa-solid fa-trash" fontSize="1.5em"/>
						</button>) : 
						(<button className="deleteBtn"></button>)
					}
				</div>
			))}
			<Signature/>
		</div>
	);
}