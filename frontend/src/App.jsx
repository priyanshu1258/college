import React from 'react';
import AboutPage from './AboutPage';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import HomePage from './HomePage';
import EventPage from './EventPage';
import Sponsors from './Sponsors';
import Contact from './Contact'
import PaymentFlow from './PaymentFlow';


function App() {
  return (
    <BrowserRouter>
      <div className="w-full min-h-screen bg-bule-400 text-white p-5">
        
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/PaymentFlow" element={<PaymentFlow />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/events" element={<EventPage />} />
          <Route path="/Sponsors" element={<Sponsors />} />
          <Route path="/Contact" element={<Contact />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;