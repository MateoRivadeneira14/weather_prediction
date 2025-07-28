
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import RainPredictionComponent from './components/RainPredictionComponent';
import PrecipitationPredictor from './components/PrecipitationPredictor';
import LandingPage from "./components/LandingPage";
import AboutModel from "./components/AboutModel";


function App() {
  const location = useLocation();

  const showNavbar = location.pathname !== "/";

  return (
    <>
      {showNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/dashboard" element={<RainPredictionComponent />} />
        <Route path="/modelo" element={<AboutModel />} />
        <Route path="/prediccion" element={<PrecipitationPredictor />} />
      </Routes>
    </>
  );
}

export default App;
