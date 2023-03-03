import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { auth } from './FirebaseConfig';
// import Login from './Login';
import Social from './Social';

function App() {
  // const [user, setUser] = useState(null);

  // useEffect(() => {
  //   const unsubscribe = auth.onAuthStateChanged((user) => {
  //     setUser(user);
  //   });

  //   return () => unsubscribe();
  // }, []);

  return (
    <Router>
      <Routes>
        {/* <Route path="/" element={user ? <Social /> : <Navigate to="/login" />} />
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} /> */}
        <Route path='/' element={<Social />} />
      </Routes>
    </Router>
  );
}

export default App;
