import React, { useState, useEffect, useRef } from "react";
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
import StrandeByMe from '../Images/StrandeByMe.png';
import CWWifi from '../Images/CWqrcode.png';
import EVqrcode from '../Images/EVqrcode.png';
import Calendar from "../Popup/Calender";
import CameraGallery from "../Gallery/CameraGallery";
import AllUsers from "../Popup/AllUsers";
import './Guide.css'

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
	const [numberOfPosts, setNumberOfPosts] = useState(0);
	const [showInfo, setShowInfo] = useState(false);
	const [seeCalender, setSeeCalender] = useState(false);
	let activeUser = props.name;

	const [isLiked, setIsLiked] = useState(false);
	const [likedIndex, setLikedIndex] = useState(null);

	const [touchStart, setTouchStart] = useState(null);
	const [touchEnd, setTouchEnd] = useState(null);

	const [addPostOpen, setAddPostOpen] = useState(false);
	const [shareOpen, setShareOpen] = useState(false);
	const [isToggled, setIsToggled] = useState(true);
	const [isFixed, setIsFixed] = useState(false);
	const documentRef = useRef(null);
	const minSwipeDistance = 50;

	const [QRsharing, setQRsharing] = useState(true);
	const [showAllUsers, setShowAllUsers] = useState(false);
	const [dateShowQR, setDateShowQR] = useState(false);

	const [firstTimer, setFirstTimer] = useState(true);

	useEffect(() => {
		firestore.collection('users').get().then((snap) => {
			const users = snap.docs.map((doc) => doc.data().user.toLowerCase());

			if (users.includes(activeUser.toLowerCase())) {
				console.log('User already exists in the collection.');
				setFirstTimer(false);
			} 
			else {
				console.log('User does not exist in the collection.');
				setFirstTimer(true);
				const accessTimes = new Date();
				firestore.collection("users").doc(activeUser.toLowerCase()).set({
					user: activeUser,
					accessTime: accessTimes,
				});
			}
		});
	}, [activeUser]);

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
		// const accessTimes = new Date();
		//GET AND SET THE DATABASE INFORMATION
		// firestore.collection("users").doc(activeUser.toLowerCase()).set({
		// 	user: activeUser,
		// 	accessTime: accessTimes,
		// });
		firestore.collection('users').get().then(snap => setCurrentUsers(snap.size));
		firestore.collection('posts').get().then(snap => setNumberOfPosts(snap.size));
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
		const expirationDate = new Date(2023,8,17,23,50,0);
		const currentDate = new Date();
		if(expirationDate <= currentDate){
			setDateShowQR(true);
		}
		firestore.collection("posts.text").onSnapshot(() => {
			window.scrollTo(0, 0);
		});
		const handleScroll = () => {
			const { top } = documentRef.current.getBoundingClientRect();
			setIsFixed(top < -40);
		};
		window.addEventListener('scroll', handleScroll);
		return () => {window.removeEventListener('scroll', handleScroll)};
	}, []);

	useEffect(() => {
		if (seeCalender || shareOpen || addPostOpen || showInfo) {
		 	document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "auto";
		}
		if(firstTimer && !loading){
			document.body.style.position = "fixed";
			document.body.style.left = "-8px";
		}else{
			document.body.style.position = "static";
		}
  	}, [seeCalender, shareOpen, addPostOpen, showInfo, firstTimer, loading]);

	//USER SUBMISSION HANDLER THAT COMPRESSES IMAGES AND LOCKS SUBMIT BTN TILL DONE
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
		//ADDS NEW POST TO DATABASE
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
	//LOADING SCREEN
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
	//LOGS IF ERROR OCCURED
	if (error) {
		return <div>Error: {error.message}</div>;
	}
	//HANDLES SWITCHING IMAGES IN THE ARRAY
	const handleClick = (index, len, direction) => {
		if (clickedImg === index) {
			if(direction === 1){
				setClickedImgIndex((clickedImgIndex + 1) % len);		//FORWARD 1 IMG
			}else{
				setClickedImgIndex((clickedImgIndex - 1 + len) % len);	//BACKWARD 1 IMG
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
	//HANDLES DELETION IF USER IS ADMIN
	const handleDelete = async (postId) => {
		if(isAdmin){
			try {
				await firestore.collection("posts").doc(postId).delete();
			  } catch (error) {
				console.error("Error removing document: ", error);
			  }
		}
	};
	//COLLECTION OF MOBILE TOUCHES
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
	//HANDLES USER CLICK OF LIKE
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
		}, 1500);

	};

	return (
		<div className="body">
			{/** BOTTOM NAVBAR */}
			<div className="userbar">
					<button className="submit gal" onClick={() => setSeeCalender(!seeCalender)}>
						<FontAwesomeIcon 
							icon={['fas','fa-calendar-alt']} 
							fontSize="1.5em"
						/>
					</button>
				<Link to='/Camera' className="nav-links">
					<button className="submit gal">
						<FontAwesomeIcon icon={['fa-solid','fa-camera']} fontSize="1.5em"/>
					</button>
				</Link>
				<button 
					className="submit gal" 
					onClick={() => setAddPostOpen(!addPostOpen)}
				>
					<FontAwesomeIcon 
						icon="fa-regular fa-square-plus" 
						fontSize="1.5em"
					/>
				</button>
				<button 
					className="submit gal"
					onClick={() => setShareOpen(!shareOpen)}
				>
					<FontAwesomeIcon 
						icon={['fas','fa-qrcode']} 
						fontSize="1.5em" 
					/>
				</button>
				<button className="logout" onClick={() => Logout({...props})}>
					<FontAwesomeIcon 
						icon={['fas','fa-right-from-bracket']} 
						fontSize="1.5em" 
					/>
				</button>
			</div>
			<p className="welcoming" ref={documentRef}>Welcome {activeUser}!</p>
			{isAdmin && <div className="info" onClick={() => setShowInfo(!showInfo)}> 
				<FontAwesomeIcon icon={["fa-solid", "fa-circle-info"]} fontSize="1.5em" />
			</div>}
			{/** POP UP TO CREATE A POST */}
			{addPostOpen ?
				(<div className="popupContainer">
					<div  className="popupForm"> 
						<form onSubmit={handleSubmit}>
							<button 
								onClick={()=> setAddPostOpen(!addPostOpen)}
								className="exitBtn deleteBtn"
							>
								<FontAwesomeIcon 
									icon="fa-solid fa-xmark" 
									fontSize="2.5em" 
								/>
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
					</div>
				</div>) : (<div></div>)
			}
			{shareOpen ?
				(<div className="popupContainer">
					<div  className="popupForm"> 
						<button 
								onClick={()=> setShareOpen(!shareOpen)}
								className="shareExit"
							>
								<FontAwesomeIcon 
									icon="fa-solid fa-xmark" 
									fontSize="2.5em" 
								/>
						</button>
						<p className="shareWith">Share with a friend!</p>
						<div className="shareContainer"> 
							<p className={`shareWith websiteQR ${QRsharing ? 'darkBG' : 'lightBG'}`} onClick={()=> setQRsharing(!QRsharing)}>Website</p> 
							<p className={`shareWith wifiQR ${QRsharing ? 'lightBG' : 'darkBG'}`} onClick={()=> setQRsharing(!QRsharing)}>WiFi</p>
						</div>
						{QRsharing ? 
							<img src={StrandeByMe} alt="website-qr-code" className="qrcode"/> :
							(dateShowQR ? 
								<img src={CWWifi} alt="wifi-qr-code" className="qrcode"/> : 
								<img src={EVqrcode} alt="wifi-qr-code" className="qrcode"/> 
							)
						}
					</div>
				</div>) : (<div></div>)
			}
			{seeCalender  && 
				<Calendar 
					seeCalender={seeCalender} 
					setSeeCalender={setSeeCalender}
				/>
			}
			<div className={`fixed-document ${isFixed ? 'fixed' : ''}`}>
				<p className={`${isToggled ? 'darkBG' : 'lightBG'}`} onClick={() => setIsToggled(!isToggled)}>Memory Gallery</p>
				<p className={`${isToggled ? 'lightBG' : 'darkBG'}`} onClick={() => setIsToggled(!isToggled)}>Captured Gallery</p>
			</div>
			{isAdmin && showInfo ?
				(<div className="popupContainer">
					<div  className={`popupForm ${showAllUsers ? 'moveUp' : ''}`}> 
						<button 
							onClick={()=> setShowInfo(!showInfo)}
							className="shareExit"
						>
							<FontAwesomeIcon 
								icon="fa-solid fa-xmark" 
								fontSize="2.5em" 
							/>
						</button>
						{isAdmin && 
							(<div className="inlineGal">
							<Link to='/Gallery' className="nav-links">
								<button className="submit gal">
									<FontAwesomeIcon 
										icon={["fas","fa-images"]} 
										fontSize="1.5em"
									/>
								</button>
							</Link>
							<p className="infoText">
								 : Memory gallery
							</p>
							</div>)
						}
						{isAdmin && 
							(<p onClick={() => setShowAllUsers(!showAllUsers)}>
								<FontAwesomeIcon 
									icon={["fas", "fa-users"]} 
									fontSize="1.5em"
								/> : {currentUsers}
							</p>)
						}
						{showAllUsers && <AllUsers/>}
						{isAdmin && <p>Number of Posts: {numberOfPosts}</p>}
					</div>
				</div>) : (<div></div>)
			}
			{firstTimer ? 
				<div className="helpGuide" onClick={() => setFirstTimer(false)}>
					<div className="helperContainer userbar">
						<div>
							<p>See<br/>Calendar</p>
						</div>
						<div className="addPhotos">
							<p>Snap<br/>A<br/>Photo</p>
						</div>
						<div className="addMemory">
							<p>Share<br/>A<br/>Memory</p>
						</div>
						<div>
							<p>Share<br/>Site/WiFi</p>
						</div>
						<div>
							<p>Logout</p>
						</div>
					</div>
					<div>
						<div className="fixed-document topHelper">
								<p>Past Memories of the couple</p>
								<p>Tonight's Memories of the couple</p>
						</div>
						<button 
							onClick={()=> setFirstTimer(false)}
							className="exitGuide"
						>
							<FontAwesomeIcon 
								icon="fa-solid fa-xmark" 
								fontSize="2.5em" 
							/>
						</button>
					</div>
				</div>:
				<div></div>
			}
			{/** MAP THROUGH ALL POSTS IN THE DATABASE */}
			{isToggled  ? (<div>{posts.map((post, index) => (
				<div 
					key={index} 
					className="posts postText" 
					data-date={post.createdAt ? post.createdAt.toDate().toLocaleDateString() : ''}
				>	<div className="post-btns">
						<p className="creator">
							{post.creator}
						</p>
						{/** LIKING FEATURE */}
						{(post.clientLike && post.clientLike.includes(activeUser)) || post.creator === activeUser ? 
							<button 
								onClick={() => handleLike(post) } 
								className="deleteBtn heartBtn"
							>
								<FontAwesomeIcon 
									icon={{prefix: 'fas', iconName: 'heart'}} 
									fontSize="2em"
								/> {post.likes} 
							</button>
							: 
							<button 
								onClick={() => { setLikedIndex(index); setIsLiked(!isLiked); 
								handleLike(post);} } 
								className="deleteBtn heartBtn"
							>
								<FontAwesomeIcon 
									icon={{prefix: 'far', iconName: 'heart'}} 
									fontSize="2em" 
								/> {post.likes} 
							</button>
						}
					</div>
					{/** DOUBLE CLICK AND MOBILE SCROLLING */}
					<div 
						onDoubleClickCapture={() => {setLikedIndex(index); setIsLiked(!isLiked);
						handleLike(post);}}
					>
						<div 
							className="imgClick" 
							onTouchStart={onTouchStart} 
							onTouchMove={onTouchMove} 
							onTouchEnd={() => onTouchEnd(index, post.imageUrls.length)}
						>
							{isLiked && likedIndex === index && 
								(<div className="popuplikecontainer">
									<p className="popupLike">
										<FontAwesomeIcon 
											icon={{prefix: 'fas', iconName: 'heart'}} 
											fontSize="5em" 
											beatFade
										/> 
									</p>
									<p className="popupLike2">
										<FontAwesomeIcon 
											icon={{prefix: 'fas', iconName: 'heart'}} 
											fontSize="7em" 
											beatFade
										/> 
									</p>
								</div>)}
							{post.imageUrls && post.imageUrls.length > 1 && 
								(<div 
									className="nextdiv" 
									onClick={() => handleClick(index, post.imageUrls.length, 1)}
								>
									<h1 className="nextBtn arrowBtn">&#8250;</h1>
								</div>)
							}
							{post.imageUrls && post.imageUrls.length > 1 && 
								(<div 
									className="backdiv" 
									onClick={() => handleClick(index, post.imageUrls.length, 0)}
								>
									<h1 className="backBtn arrowBtn">&#8249;</h1>
								</div>)
							}
							{post.imageUrls && post.imageUrls.length > 0 && clickedImg === index && (
								<img 
									src={post.imageUrls[clickedImgIndex]} 
									alt={`Uploaded by ${post.creator}`} 
									className="img"
								/>
							)}
							{post.imageUrls && post.imageUrls.length > 0 && clickedImg !== index && (
								<img 
									src={post.imageUrls[0]} 
									alt={`Uploaded by ${post.creator}`} 
									className="img"
								/>
							)}
						</div>
					</div>
					{/** BUBBLE INDICATOR */}
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
					{/** POST'S TEXT */}
					{post.text ?
						<p 
							className="textPost" 
							onDoubleClickCapture={() => {
								setLikedIndex(index); 
								setIsLiked(!isLiked); 
								handleLike(post);
							}}
						>
							{post.text}
						</p>
						:
						<p></p>
					}
					{/** DELETE BUTTON ONLY FOR ADMIN */}
					{isAdmin ? 
						(<button 
							className="deleteBtn" 
							onClick={() => handleDelete(post.id)}
						>
							<FontAwesomeIcon icon="fa-solid fa-trash" fontSize="1.5em"/>
						</button>) : 
						(<button className="deleteBtn"></button>)
					}
				</div>
			))}</div>) : (<CameraGallery activeUser={activeUser}/>)}
			<Signature/>
		</div>
	);
}