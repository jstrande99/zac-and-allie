import React, { useEffect, useState } from 'react';
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/storage";
import "firebase/compat/auth";
import './AllUsers.css';


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
const AllUsers = () => {
    const [allUsers, setAllUsers] = useState([]);
    useEffect(() => {
        firestore.collection('users').get().then((snap) => {
            const users = snap.docs.map((doc) => doc.data().user);
            setAllUsers(users);
        });
    }, []);
    return (
        <div className='AllUsers'>
            {allUsers.map((user, index) => (<p key={index} className='individualUsers'>{user}</p>))}
        </div>
    )
}
export default AllUsers;