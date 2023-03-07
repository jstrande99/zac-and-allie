import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { auth } from './FirebaseConfig';
// import Login from './Login';
import Social from './Social';
import Name from './Name';
import Gallery from './Gallery';

function App() {
  // const [user, setUser] = useState(null);

  // useEffect(() => {
  //   const unsubscribe = auth.onAuthStateChanged((user) => {
  //     setUser(user);
  //   });

  //   return () => unsubscribe();
  // }, []);
  const [firstName, setFirstName] = useState(""); 
  const [lastName, setLastName] = useState("");
  const [name, setName] = useState(false);
  return (
    <Router>
      <Routes>
        {/* <Route path="/" element={user ? <Social /> : <Navigate to="/login" />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} /> */}
        <Route path='/' element={name ? <Social name={name} /> : < Name firstName={firstName} setFirstName={setFirstName} lastName={lastName} setLastName={setLastName} name={name} setName={setName}/> } />
        <Route path='/Gallery' element={<Gallery/>}/>
      </Routes>
    </Router>

  );
}

export default App;
