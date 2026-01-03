import React, { useState } from 'react';
import { ASSETS, COLORS } from '../constants';

interface StartScreenProps {
  onStart: (avatar: string) => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ onStart }) => {
  const [selectedAvatar, setSelectedAvatar] = useState(ASSETS.playerOptions[0]);

  return (
    <div className={`flex flex-col items-center justify-center h-full w-full p-6 text-center animate-fade-in`}>
      <h1 className={`text-6xl font-display mb-2 text-white drop-shadow-lg transform -rotate-2`}>
        Doce
      </h1>
      <h2 className={`text-5xl font-display mb-8 text-yellow-300 drop-shadow-md transform rotate-2`}>
        Aventura
      </h2>
      
      <div className="bg-white/30 backdrop-blur-sm p-6 rounded-2xl w-full max-w-xs border-2 border-white/50">
        <p className="text-white font-bold mb-4 text-xl drop-shadow">Escolha seu personagem:</p>
        
        <div className="flex justify-center gap-4 mb-8">
          {ASSETS.playerOptions.map((avatar) => (
            <button
              key={avatar}
              onClick={() => setSelectedAvatar(avatar)}
              className={`text-5xl p-4 rounded-2xl transition-all transform duration-200 ${
                selectedAvatar === avatar 
                  ? 'bg-white scale-110 shadow-xl border-4 border-pink-400' 
                  : 'bg-white/50 grayscale opacity-70 hover:opacity-100 hover:scale-105'
              }`}
            >
              {avatar}
            </button>
          ))}
        </div>

        <button
          onClick={() => onStart(selectedAvatar)}
          className={`w-full py-4 px-8 rounded-full text-white font-display font-bold text-2xl shadow-xl transform transition hover:scale-105 active:scale-95 ${COLORS.buttonBg} border-b-4 border-purple-600`}
        >
          Jogar
        </button>
      </div>
      
      <div className="mt-8 text-white font-bold text-sm opacity-80">
        Colete itens bons 🎂 <br/> Evite o brócolis 🥦
      </div>
    </div>
  );
};

export default StartScreen;