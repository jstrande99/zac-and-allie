import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Social from './Social';
import Name from './Name';
import Gallery from './Gallery';
import Schedule from './Schedule';

function App() {
  const [firstName, setFirstName] = useState(""); 
  const [lastName, setLastName] = useState("");
  const [name, setName] = useState(false);
  return (
    <Router>
      <Routes>
        <Route path='/' element={name ? <Social name={name} /> : < Name firstName={firstName} setFirstName={setFirstName} lastName={lastName} setLastName={setLastName} name={name} setName={setName}/> } />
        <Route path='/Gallery' element={<Gallery/>}/>
        <Route path='/Schedule' element={<Schedule/>}/>
      </Routes>
    </Router>

  );
}

export default App;
