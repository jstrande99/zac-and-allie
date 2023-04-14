import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Social from './Social';
import Name from './Name';
import Gallery from './Gallery';
import Schedule from './Schedule';

function App() {
  const [firstName, setFirstName] = useState(""); 
  const [lastName, setLastName] = useState("");
  const [name, setName] = useState(null);
  const [timer, setTimer] = useState(3700);
  return (
    <Router>
      <Routes>
        <Route path='/' element={name ? <Social name={name} setName={setName} timer={timer} setFirstName={setFirstName} setLastName={setLastName}/> : < Name firstName={firstName} setFirstName={setFirstName} lastName={lastName} setLastName={setLastName} name={name} setName={setName} setTimer={setTimer}/> } />
        <Route path='/Gallery' element={name && <Gallery setTimer={setTimer}/>}/>
        <Route path='/Schedule' element={name && <Schedule setTimer={setTimer}/>}/>
      </Routes>
    </Router>

  );
}

export default App;
