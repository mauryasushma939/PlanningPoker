
import React, { useState, useEffect, useRef } from 'react';
import { SocketProvider } from './contexts/SocketContext';
import LandingPage from './components/LandingPage';
import PlanningPokerBoard from './components/PlanningPokerBoard';
import Header from './components/Header';

function InactivityPopup({ show, onClose }) {
  if (!show) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.35)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: '2.5rem 2.5rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
        textAlign: 'center',
        minWidth: 320
      }}>
        <h2 style={{marginBottom: '1rem'}}>Seems like you're not active!</h2>
        <p style={{marginBottom: '2rem'}}>You have been inactive for 15 minutes.</p>
        <button onClick={onClose} style={{padding: '0.7rem 2.2rem', fontSize: '1.1rem', borderRadius: 8, background: '#00d9ff', color: '#fff', border: 'none', cursor: 'pointer'}}>OK</button>
      </div>
    </div>
  );
}

console.log('🚀 App starting...');
console.log('Environment variables in App.js:', {
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  REACT_APP_SOCKET_URL: process.env.REACT_APP_SOCKET_URL,
  NODE_ENV: process.env.NODE_ENV
});

function App() {
    const [showInactive, setShowInactive] = useState(false);
    const timerRef = useRef();

    useEffect(() => {
      const resetTimer = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setShowInactive(true), 15 * 60 * 1000); // 15 min
        setShowInactive(false);
      };
      const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
      events.forEach(e => window.addEventListener(e, resetTimer));
      resetTimer();
      return () => {
        events.forEach(e => window.removeEventListener(e, resetTimer));
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }, []);
  const [currentView, setCurrentView] = useState('landing'); // 'landing' or 'poker'
  const [roomData, setRoomData] = useState(null);

  const handleStartSession = (data) => {
    setRoomData(data);
    setCurrentView('poker');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    setRoomData(null);
  };

  return (
    <SocketProvider>
      <div className="App">
        <Header />
        <InactivityPopup show={showInactive} onClose={() => setShowInactive(false)} />
        {currentView === 'landing' ? (
          <LandingPage onStartSession={handleStartSession} />
        ) : (
          <PlanningPokerBoard 
            roomData={roomData} 
            onBack={handleBackToLanding}
          />
        )}
      </div>
    </SocketProvider>
  );
}

export default App;
