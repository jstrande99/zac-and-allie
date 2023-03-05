import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/storage";
import "firebase/compat/auth";
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
// const auth = firebase.auth(firebase.initializeApp(firebaseConfig));

export default function Social(props) {
	const [text, setText] = useState("");
	const [sortBy, setSortBy] = useState("createdAt");
	const [posts, setPosts] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [imageFiles, setImageFiles] = useState([]);
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	let activeUser = props.name;

	useEffect(() => {
		setLoading(true);
		const unsubscribe = firestore.collection("posts")
		  .orderBy(sortBy, "desc")
		  .onSnapshot(snapshot => {
			const updatedPosts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
			setTimeout(() => { // add delay here
				setPosts(updatedPosts);
				setLoading(false);
			  }, 3000);
		  }, error => {
			setError(error);
			setLoading(false);
		  });
		return unsubscribe;
	  }, [sortBy]);

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
	
		let imageUrls = [];
		if(imageFiles.length > 0){
			for(let i = 0; i < imageFiles.length; i++){
				const imageFile = imageFiles[i];
				const storageRef = storage.ref().child(`images/${imageFile.name}`);
				await storageRef.put(imageFile);
				const imageUrl = await storageRef.getDownloadURL();
				imageUrls.push(imageUrl);
			}
		}

		firestore.collection("posts").add({
			text,
			imageUrls,
			createdAt: firebase.firestore.FieldValue.serverTimestamp(),
			likes: 0,
			creator: activeUser,
		}).then((docRef) => {
			docRef.set({ id: docRef.id }, { merge: true });
		});
		setText("");
		setImageFiles([]);
	};
	
	const handleImageChange = (event) => {
		setImageFiles(event.target.files);
	};

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
				clientLike: firebase.firestore.FieldValue.arrayUnion(activeUser) 
			});
		} else {
			console.log("Document does not exist!");
		}
	};
  
	if (loading) {
		return (
			<div className={`fullscreen-${loading}`}>
				<div className='innerLoading'>
                    <p>Share the fun photos and memories that you have of the loving couple! Disclaimer: please keep them appropriate!</p>
				</div>
			</div>
		)
	}

	if (error) {
		return <div>Error: {error.message}</div>;
	}
	return (
		<div className="body">
			<div>
				<select value={sortBy} className="dropdown-item" onChange={(e) => setSortBy(e.target.value)}>
					<option value="createdAt">Sort by Date</option>
					<option value="likes">Sort by Popularity</option>
					<option value="creator">{activeUser}'s Posts</option>
				</select>
			</div>
			<p className="welcoming">Welcome to the Party {activeUser}!</p>
			<form onSubmit={handleSubmit}>
				<input className="textBox" type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Post A Memory!"/>
				<input type="file" className="imgInput" name="imageFile" accept="image/*" onChange={handleImageChange} multiple/>
				<button className="submit postBtn" type="submit">Post</button>
			</form>
			{posts.map((post, index) => (
				<div key={index} className="posts postText" data-date={post.createdAt ? post.createdAt.toDate().toLocaleDateString() : ''} onClick={() => setCurrentImageIndex((currentImageIndex + 1)%post.imageUrls.length)}>
					<p className="creator">{post.creator}</p>
					<div className="imgClick" >
						{post.imageUrls && post.imageUrls.length > 0 && (
							<img src={post.imageUrls[currentImageIndex]} alt={`Uploaded by ${post.creator}`} className="img" style={{ maxWidth: "100%", maxHeight: "300px", objectFit:"contain" }}/>
						)}
						<p className="indicator">{currentImageIndex + 1} of {post.imageUrls.length}</p>
					</div>
					<p>{post.text ? post.text : <br/>}</p>
					<div className="likes">
						<button onClick={() => handleLike(post)} className="btn likeBTN"> {post.likes} Likes</button>
					</div>
				</div>
			))}
		</div>
	);
}