import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/storage";
import "firebase/compat/auth";
import imageCompression from 'browser-image-compression';
import heic2any from "heic2any";
import { Link } from "react-router-dom";

import './Social.css';

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
	
	useEffect(() => {
		const adminNames = ["zac strande", "allie strande", "jordan strande", "dae judd", "bill strande", "charlotte strande"];
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
			  }, 4000);
		  }, error => {
			setError(error);
			setLoading(false);
		  });
		return unsubscribe;
	  }, [activeUser]);

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
					console.log(compressedFile.size/1024/1024);
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
				setClickedImgIndex((clickedImgIndex - 1) % len); 
			}
		} else {
		  setClickedImg(index); 
		  setClickedImgIndex(0); 
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

	return (
		<div className="body">
			{isAdmin && (<Link to='/Gallery' className="nav-links">
                <button className="submit gal"> View Gallery</button>
            </Link>)}
			{isAdmin && (<p className="welcoming">Active Users: {currentUsers}</p>)}
			<p className="welcoming">Welcome to the Party {activeUser}!</p>
			<form onSubmit={handleSubmit}>
				<input className="textBox" type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Write to the happy couple..."/>
				<input type="file" className="imgInput" name="imageFile" accept="image/* image/heic" onChange={handleImageChange} multiple/>
				<button className="submit postBtn" type="submit" disabled={isDisabled}>{createPost}</button>
			</form>
			{posts.map((post, index) => (
				<div key={index} className="posts postText" data-date={post.createdAt ? post.createdAt.toDate().toLocaleDateString() : ''}>
					<p className="creator">{post.creator}</p>
					<div className="imgClick" >
						{post.imageUrls && post.imageUrls.length > 1 && (<div className="nextdiv" onClick={() => handleClick(index, post.imageUrls.length, 1)}><h1 className="nextBtn arrowBtn">&#8250;</h1></div>)}
						{post.imageUrls && post.imageUrls.length > 1 && (<div className="backdiv" onClick={() => handleClick(index, post.imageUrls.length, 0)}><h1 className="backBtn arrowBtn">&#8249;</h1></div>)}
						{post.imageUrls && post.imageUrls.length > 0 && clickedImg === index && (
							<img src={post.imageUrls[clickedImgIndex]} alt={`Uploaded by ${post.creator}`} className="img"/>
						)}
						{post.imageUrls && post.imageUrls.length > 0 && clickedImg !== index && (
							<img src={post.imageUrls[0]} alt={`Uploaded by ${post.creator}`} className="img"/>
						)}
					</div>
					{post.imageUrls.length !== 0 && (<p className="indicator">{clickedImg === index ? clickedImgIndex + 1 : 1} of {post.imageUrls ? post.imageUrls.length : 0}</p>)}
					{post.text && <p className="textPost">{post.text}</p>}
					{ isAdmin && (<button className="deleteBtn submit" onClick={() => handleDelete(post.id)}>Delete</button>)}
				</div>
			))}
		</div>
	);
}