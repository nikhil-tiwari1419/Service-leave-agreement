import React from 'react'
import { Routes, Route } from 'react-router-dom';
import Home from './Pages/Home';
import Dashboard from './Pages/Dashboard';
import Contact from './Pages/Contact';
import Login from './Pages/Login';
import {Toaster} from 'react-hot-toast'

function App() {
  return (
    <>
    <Toaster 
        position="top"
        reverseOrder={false}
      />
    <Routes>
      <Route path='/' element={<Home />} />
      <Route path='/Dashboard' element={<Dashboard />} />
      <Route path='/Contact' element={<Contact />} />
      <Route path='/Login' element={<Login />} />
    </Routes>
    </>
  )
}

export default App