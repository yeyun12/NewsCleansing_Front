// src/App.js
import React from 'react';
import Router from '../routes';
import { useLocation } from 'react-router-dom';
import { NavBar } from '../components/common/NavBar';
import { TopBar } from '../components/common/TopBar';
import './App.css';
import { ScrollToTop } from '../components/common/ScrollToTop';

const App = () => {
  const location = useLocation();
  const hideBars = location.pathname === '/' || location.pathname === '/signin' || location.pathname === '/signup';
  return (
    <div className='app'>
      {!hideBars && <TopBar />}
      <ScrollToTop>
        <Router />
      </ScrollToTop>
      {!hideBars && <NavBar />}
    </div>
  );
};

export default App;
