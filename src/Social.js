import React, { useState, useEffect } from "react";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/storage";
import "firebase/compat/auth";
import './Social.css';
// import Login from "./Login";

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
	const [imageFile, setImageFile] = useState(null);
	// const [user, setUser] = useState(null);
	// const [isOpen, setIsOpen] = useState(false);
	let activeUser = props.name;

	useEffect(() => {
		console.log(sortBy)
		setLoading(true);
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
	  }, [sortBy]);

	useEffect(() => {
		firestore.collection("posts.text").onSnapshot(() => {
		window.scrollTo(0, 0); //document.body.scrollHeight
		});
		// const unsubscribe = auth.onAuthStateChanged((user) => {
		// 	setUser(user);
		//   });
		//   return unsubscribe;
	}, []);
	
	
	// if (!user) {
	// 	return <Login />;
	// }

	const handleSubmit = async (event) => {
		event.preventDefault();
		if(!text && !imageFile){
			alert("Please enter a memory!");
			return;
		}
		let imageUrl = null; 
		if(imageFile){
			const imageFile = event.target.elements.imageFile.files[0];
			const storageRef = storage.ref().child(`images/${imageFile.name}`);
			await storageRef.put(imageFile);
            
                imageUrl = await storageRef.getDownloadURL();
        }
		firestore.collection("posts").add({
			text,
			imageUrl,
			createdAt: firebase.firestore.FieldValue.serverTimestamp(),
			likes: 0,
			creator: activeUser,
		}).then((docRef) => {
			docRef.set({ id: docRef.id }, { merge: true });
		});
		setText("");
		setImageFile(null);
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
				<div className='innerSpin'>
					{/* <img src={Floating} alt='Astronat' className='loadImg'/> */}
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
				<input type="file" className="imgInput" name="imageFile" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])}/>
				<button className="submit postBtn" type="submit">Post</button>
			</form>
			{posts.map((post, index) => (
				<div key={index} className="posts postText" data-date={post.createdAt ? post.createdAt.toDate().toLocaleDateString() : ''}>
					<p className="creator">{post.creator}</p>
					{post.imageUrl && (
						<img src={post.imageUrl} alt="Uploaded by user" className="img" style={{ maxWidth: "70%", maxHeight: "300px", objectFit:"contain", marginLeft:"15%" }}/>
					)}
					<p>{post.text}</p>
					<div className="likes">
						<button onClick={() => handleLike(post)} className="btn likeBTN"> {post.likes} Likes</button>
					</div>
				</div>
			))}
		</div>
	);
}