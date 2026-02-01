import React from 'react'
import { Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import Dashboard from './Pages/Dashboard';
import Contact from './Pages/Contact';
import Login from './Pages/Login';
import Review from './Pages/Review';
import { Toaster } from 'react-hot-toast'
import { GrievanceProvider } from './Context/GrievanceContext';

function App() {
  return (
    
      <GrievanceProvider>

        <Toaster
          position="top"
          reverseOrder={false}
        />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/Dashboard' element={<Dashboard />} />
          <Route path='/Contact' element={<Contact />} />
          <Route path='/Login' element={<Login />} />
          <Route path='/Review' element={<Review />} />
        </Routes>
      </GrievanceProvider>
   
  )
}

export default App