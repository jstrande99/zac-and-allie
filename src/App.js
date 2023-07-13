import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Social from './Social';
import Name from './Name';
import Gallery from './Gallery';
import Camera from './Cameras';

function App() {
  const [firstName, setFirstName] = useState(""); 
  const [lastName, setLastName] = useState("");
  const [name, setName] = useState(null);
  const [timer, setTimer] = useState(3700);
  return (
    <Router>
      <Routes>

        <Route path='/' element={
          name ? 
            <Social 
              name={name}
              setName={setName} 
              timer={timer} 
              setFirstName={setFirstName} 
              setLastName={setLastName} 
            /> : 
            < Name 
              firstName={firstName} 
              setFirstName={setFirstName} 
              lastName={lastName} 
              setLastName={setLastName} 
              name={name} 
              setName={setName} 
              setTimer={setTimer}/> 
          } />

        <Route path='/Gallery' element={
          name ? 
            <Gallery 
              setTimer={setTimer} 
              setName={setName} 
              setFirstName={setFirstName} 
              setLastName={setLastName}
            /> : 
            <Navigate to="/" />
        }/>

        <Route path='/Camera' element={
          name ? 
            <Camera 
              name={name}
              setTimer={setTimer} 
              setName={setName} 
              setFirstName={setFirstName} 
              setLastName={setLastName}
            /> : 
            <Navigate to="/" />
        }/>
        
      </Routes>
    </Router>

  );
}

export default App;
