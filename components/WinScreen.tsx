import React, { useEffect, useRef } from 'react';
import { playSound } from '../constants';

interface WinScreenProps {
  onRestart: () => void;
}

const WinScreen: React.FC<WinScreenProps> = ({ onRestart }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Initial Win Confetti
    // @ts-ignore
    if (window.confetti) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };
      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        const particleCount = 50 * (timeLeft / duration);
        // @ts-ignore
        window.confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
        // @ts-ignore
        window.confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
      }, 250);
      return () => clearInterval(interval);
    }
  }, []);

  const handleClaim = () => {
    // Pausa a música de fundo se possível (tentativa via DOM, já que o ref está no App)
    const bgMusic = document.querySelector('audio');
    if (bgMusic) bgMusic.pause();

    playSound('explosion');
    playSound('happy_birthday');

    if (buttonRef.current) {
        // Create an explosion originating from the button center
        const rect = buttonRef.current.getBoundingClientRect();
        const x = (rect.left + rect.width / 2) / window.innerWidth;
        const y = (rect.top + rect.height / 2) / window.innerHeight;

        // @ts-ignore
        if (window.confetti) {
            // @ts-ignore
            window.confetti({
                particleCount: 150,
                spread: 100,
                origin: { x, y },
                scalar: 1.2,
                colors: ['#FF69B4', '#FFD700', '#00FFFF'],
                startVelocity: 45
            });
        }
    }

    // Small delay for the visual effect before the alert
    setTimeout(() => {
        alert("🎁 Parabéns Ana Yvina! \n\nO seu presente é um abraço muito apertado e todo o carinho do mundo! \n(Ou vá cobrar seu primo/prima!)");
    }, 500); // Aumentei um pouco o delay para dar tempo de ouvir o início da música
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-4 text-center z-50 relative">
      <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl border-4 border-white transform animate-[bounce_2s_infinite]">
        
        <h1 className={`text-4xl md:text-5xl font-display mb-2 text-pink-500 leading-tight`}>
          Parabéns,
        </h1>
        <h1 className={`text-5xl md:text-6xl font-display mb-8 text-purple-600 leading-tight`}>
          Ana Yvina!
        </h1>
        
        <div className="text-6xl mb-8 flex justify-center gap-4 animate-pulse">
           <span>👸</span><span>🧁</span><span>✨</span>
        </div>

        <p className="text-gray-600 mb-8 text-lg font-bold">
          Você pegou todos os doces!
        </p>

        <div className="flex flex-col gap-4 w-full">
          <button
            ref={buttonRef}
            onClick={handleClaim}
            className={`w-full py-4 px-6 rounded-xl text-white font-bold text-xl shadow-lg transform transition hover:scale-110 active:scale-95 bg-green-500 hover:bg-green-600 border-b-4 border-green-700 animate-pulse`}
          >
            🎁 Resgatar Presente
          </button>
          
          <button
            onClick={onRestart}
            className="text-pink-400 font-bold hover:underline mt-2"
          >
            Jogar Novamente
          </button>
        </div>
      </div>
    </div>
  );
};

export default WinScreen;