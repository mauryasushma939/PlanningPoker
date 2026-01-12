import React, { useState } from 'react';
import { SocketProvider } from './contexts/SocketContext';
import LandingPage from './components/LandingPage';
import PlanningPokerBoard from './components/PlanningPokerBoard';

console.log('🚀 App starting...');
console.log('Environment variables in App.js:', {
  REACT_APP_API_URL: process.env.REACT_APP_API_URL,
  REACT_APP_SOCKET_URL: process.env.REACT_APP_SOCKET_URL,
  NODE_ENV: process.env.NODE_ENV
});

function App() {
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
