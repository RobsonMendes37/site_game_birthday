import React, { useState, useRef, useEffect } from 'react';
import StartScreen from './components/StartScreen';
import GameLoop from './components/GameLoop';
import WinScreen from './components/WinScreen';
import { GameState } from './types';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.START);
  const [playerAvatar, setPlayerAvatar] = useState<string>('👸');
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Attempt to autoplay if possible, or wait for interaction
    if (audioRef.current && !isMuted) {
        audioRef.current.volume = 0.4;
        audioRef.current.play().catch(e => console.log("Audio autoplay blocked, waiting for interaction"));
    }
  }, [isMuted]);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.play();
        setIsMuted(false);
      } else {
        audioRef.current.pause();
        setIsMuted(true);
      }
    }
  };

  const startGame = (avatar: string) => {
    // Ensure music starts on first interaction
    if (audioRef.current && !isMuted && audioRef.current.paused) {
        audioRef.current.play();
    }
    setPlayerAvatar(avatar);
    setGameState(GameState.PLAYING);
  };

  const handleWin = () => {
    setGameState(GameState.WON);
  };

  const handleGameOver = () => {
    setGameState(GameState.GAME_OVER);
  };

  const restartGame = () => {
    setGameState(GameState.START);
  };

  const retryGame = () => {
    setGameState(GameState.PLAYING);
  }

  // Exact gradient requested: #ff9a9e to #fad0c4
  const bgStyle = {
    background: 'linear-gradient(to bottom, #ff9a9e 0%, #fad0c4 100%)'
  };

  return (
    <div style={bgStyle} className="h-screen w-screen overflow-hidden select-none flex flex-col items-center justify-center">
        
      {/* Background Music - royalty free upbeat loop */}
      <audio ref={audioRef} loop>
        <source src="https://cdn.pixabay.com/audio/2022/10/26/audio_67eb509376.mp3" type="audio/mpeg" />
      </audio>

      {/* Music Toggle */}
      <button 
        onClick={toggleMusic}
        className="absolute top-4 right-4 z-50 bg-white/50 p-2 rounded-full backdrop-blur-sm shadow-sm"
      >
        {isMuted ? '🔇' : '🔊'}
      </button>

      <div className="h-full w-full max-w-md mx-auto relative bg-white/20 shadow-2xl md:rounded-xl md:h-[95vh] md:mt-[2.5vh] md:border-4 md:border-white/40 overflow-hidden backdrop-blur-sm">
        
        {gameState === GameState.START && (
          <StartScreen onStart={startGame} />
        )}

        {gameState === GameState.PLAYING && (
          <GameLoop 
            avatar={playerAvatar} 
            onWin={handleWin} 
            onGameOver={handleGameOver}
          />
        )}

        {gameState === GameState.GAME_OVER && (
           <div className="flex flex-col items-center justify-center h-full w-full p-6 text-center animate-fade-in">
             <div className="text-6xl mb-4">😢</div>
             <h2 className="text-4xl text-white font-display drop-shadow-md mb-4">Que pena!</h2>
             <p className="text-white text-xl mb-8 font-bold">Cuidado com o brócolis!</p>
             <button onClick={retryGame} className="bg-white text-pink-500 font-bold py-3 px-8 rounded-full shadow-lg text-xl hover:scale-105 transition">
               Tentar de Novo
             </button>
           </div>
        )}

        {gameState === GameState.WON && (
          <WinScreen onRestart={restartGame} />
        )}
        
      </div>
    </div>
  );
};

export default App;